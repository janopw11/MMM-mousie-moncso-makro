package com.mmm.makros.repository;

import com.mmm.makros.entity.SavedMeal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavedMealRepository extends JpaRepository<SavedMeal, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<SavedMeal> findAllByOrderByNameAsc(Pageable pageable);

    @Query("select distinct m from SavedMeal m left join fetch m.items where m.id in :ids order by m.name asc")
    List<SavedMeal> findByIdsWithItems(@Param("ids") List<Long> ids);

    @Query("select m.id from SavedMeal m where lower(m.name) like lower(concat('%', :q, '%')) order by m.name asc")
    List<Long> findIdsByNameContaining(@Param("q") String q, Pageable pageable);

    // PostgreSQL full text search (prefix matching per term) combined with substring match
    @Query(value = """
            select id from saved_meals
            where to_tsvector('simple', name) @@ to_tsquery('simple', :tsQuery)
               or lower(name) like lower(concat('%', :q, '%'))
            order by name asc
            limit :limit
            """, nativeQuery = true)
    List<Long> fullTextSearchIds(@Param("tsQuery") String tsQuery, @Param("q") String q, @Param("limit") int limit);
}
