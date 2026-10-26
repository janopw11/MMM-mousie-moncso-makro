package com.mmm.makros;

import com.mmm.makros.dto.CreateMealRequest;
import com.mmm.makros.dto.CreateProductRequest;
import com.mmm.makros.dto.CreateUserRequest;
import com.mmm.makros.dto.MealItemRequest;
import com.mmm.makros.dto.ProductDto;
import com.mmm.makros.dto.UpdateDailyGoalRequest;
import com.mmm.makros.dto.UserDto;
import com.mmm.makros.dto.DaySummaryDto;
import com.mmm.makros.entity.MealItemType;
import com.mmm.makros.entity.MealType;
import com.mmm.makros.exception.ConflictException;
import com.mmm.makros.service.GoalService;
import com.mmm.makros.service.MealService;
import com.mmm.makros.service.ProductService;
import com.mmm.makros.service.SummaryService;
import com.mmm.makros.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class MakrosApplicationTests {

    @Autowired
    private UserService userService;
    @Autowired
    private GoalService goalService;
    @Autowired
    private MealService mealService;
    @Autowired
    private SummaryService summaryService;
    @Autowired
    private ProductService productService;

    @Test
    void contextLoads() {
    }

    @Test
    void endToEndDayFlow() {
        UserDto user = userService.createUser(new CreateUserRequest("tester-" + System.nanoTime()));
        LocalDate date = LocalDate.now();

        goalService.upsertGoal(user.id(), date, new UpdateDailyGoalRequest(
                BigDecimal.valueOf(150), BigDecimal.valueOf(200), BigDecimal.valueOf(60), 500));

        mealService.createMeal(user.id(), new CreateMealRequest(
                date, "Oatmeal", MealType.BREAKFAST,
                List.of(
                        new MealItemRequest(MealItemType.INGREDIENT, "Oats", BigDecimal.valueOf(85),
                                BigDecimal.valueOf(12), BigDecimal.valueOf(50), BigDecimal.valueOf(7)),
                        new MealItemRequest(MealItemType.VEGGIE, "Carrot", BigDecimal.valueOf(100),
                                null, null, null)
                )));

        DaySummaryDto summary = summaryService.getDaySummary(user.id(), date);

        // calories = 12*4 + 50*4 + 7*9 = 48 + 200 + 63 = 311
        assertThat(summary.consumed().calories()).isEqualByComparingTo(BigDecimal.valueOf(311.0));
        assertThat(summary.veggiesConsumedG()).isEqualByComparingTo(BigDecimal.valueOf(100));
        assertThat(summary.remaining().proteinG()).isEqualByComparingTo(BigDecimal.valueOf(138));
    }

    @Test
    void productSearchAndCreate() {
        String uniqueName = "Test Oats " + System.nanoTime();
        ProductDto created = productService.create(new CreateProductRequest(
                uniqueName, BigDecimal.valueOf(13.5), BigDecimal.valueOf(68), BigDecimal.valueOf(6.5)));

        assertThat(created.custom()).isTrue();
        // calories = 13.5*4 + 68*4 + 6.5*9 = 54 + 272 + 58.5 = 384.5
        assertThat(created.calories()).isEqualByComparingTo(BigDecimal.valueOf(384.5));

        List<ProductDto> results = productService.search(uniqueName.substring(0, 9));
        assertThat(results).extracting(ProductDto::name).contains(uniqueName);

        assertThatThrownBy(() -> productService.create(new CreateProductRequest(
                uniqueName.toUpperCase(), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)))
                .isInstanceOf(ConflictException.class);
    }
}
