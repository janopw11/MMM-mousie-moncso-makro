package com.mmm.makros.controller;

import com.mmm.makros.dto.CreateProductRequest;
import com.mmm.makros.dto.ProductDto;
import com.mmm.makros.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private static final int MAX_LIMIT = 500;

    private final ProductService productService;

    @GetMapping
    public List<ProductDto> search(@RequestParam(required = false) String search,
                                    @RequestParam(defaultValue = "20") int limit) {
        return productService.search(search, Math.max(1, Math.min(limit, MAX_LIMIT)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
