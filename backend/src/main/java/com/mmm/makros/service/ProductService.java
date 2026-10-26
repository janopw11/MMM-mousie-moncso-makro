package com.mmm.makros.service;

import com.mmm.makros.dto.CreateProductRequest;
import com.mmm.makros.dto.MacroTotals;
import com.mmm.makros.dto.ProductDto;
import com.mmm.makros.entity.Product;
import com.mmm.makros.exception.ConflictException;
import com.mmm.makros.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private static final int SEARCH_LIMIT = 20;

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> search(String query) {
        Pageable limit = PageRequest.of(0, SEARCH_LIMIT);
        List<Product> products = (query == null || query.isBlank())
                ? productRepository.findAllByOrderByNameAsc().stream().limit(SEARCH_LIMIT).toList()
                : productRepository.findByNameContainingIgnoreCaseOrderByNameAsc(query.trim(), limit);
        return products.stream().map(this::toDto).toList();
    }

    public ProductDto create(CreateProductRequest request) {
        String name = request.name().trim();
        if (productRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Product '" + name + "' already exists");
        }
        Product product = Product.builder()
                .name(name)
                .proteinG(request.proteinG())
                .carbsG(request.carbsG())
                .fatG(request.fatG())
                .custom(true)
                .build();
        return toDto(productRepository.save(product));
    }

    private ProductDto toDto(Product product) {
        MacroTotals totals = MacroTotals.of(product.getProteinG(), product.getCarbsG(), product.getFatG());
        return new ProductDto(product.getId(), product.getName(), product.getProteinG(), product.getCarbsG(),
                product.getFatG(), totals.calories(), product.isCustom());
    }
}
