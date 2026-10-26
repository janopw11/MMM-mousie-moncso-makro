package com.mmm.makros.service;

import com.mmm.makros.dto.CreateProductRequest;
import com.mmm.makros.dto.MacroTotals;
import com.mmm.makros.dto.ProductDto;
import com.mmm.makros.entity.Product;
import com.mmm.makros.exception.ConflictException;
import com.mmm.makros.exception.NotFoundException;
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
        return search(query, SEARCH_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> search(String query, int limit) {
        Pageable limitedPage = PageRequest.of(0, limit);
        List<Product> products = (query == null || query.isBlank())
                ? productRepository.findAllByOrderByNameAsc().stream().limit(limit).toList()
                : productRepository.findByNameContainingIgnoreCaseOrderByNameAsc(query.trim(), limitedPage);
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

    public ProductDto update(Long id, CreateProductRequest request) {
        Product product = findEntity(id);
        String name = request.name().trim();
        if (productRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Product '" + name + "' already exists");
        }
        product.setName(name);
        product.setProteinG(request.proteinG());
        product.setCarbsG(request.carbsG());
        product.setFatG(request.fatG());
        return toDto(productRepository.save(product));
    }

    public void delete(Long id) {
        Product product = findEntity(id);
        productRepository.delete(product);
    }

    private Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    private ProductDto toDto(Product product) {
        MacroTotals totals = MacroTotals.of(product.getProteinG(), product.getCarbsG(), product.getFatG());
        return new ProductDto(product.getId(), product.getName(), product.getProteinG(), product.getCarbsG(),
                product.getFatG(), totals.calories(), product.isCustom());
    }
}
