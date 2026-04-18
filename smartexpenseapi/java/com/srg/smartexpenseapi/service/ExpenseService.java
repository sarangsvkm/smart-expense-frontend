package com.srg.smartexpenseapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.srg.smartexpenseapi.entity.Expense;
import com.srg.smartexpenseapi.entity.User;
import com.srg.smartexpenseapi.payload.response.DiscoveryResponse;
import com.srg.smartexpenseapi.repository.ExpenseRepository;
import com.srg.smartexpenseapi.repository.CategoryRepository;
import com.srg.smartexpenseapi.entity.Category;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Expense> getAllExpensesByUser(User user) {
        return expenseRepository.findByUser(user);
    }

    public List<Expense> getAllExpensesByUserId(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    @Autowired
    private SmartDiscoveryService discoveryService;

    public Expense saveExpense(Expense expense) {
        // Auto-Discovery: If category is missing or default, try to discover from description
        if (expense.getCategory() == null || "MISCELLANEOUS".equals(expense.getCategory().getName())) {
            DiscoveryResponse discovery = discoveryService.discover(expense.getDescription());
            
            // Set discovered category
            Category category = categoryRepository.findByName(discovery.getCategory())
                .orElseGet(() -> categoryRepository.save(new Category(discovery.getCategory())));
            expense.setCategory(category);
            
            // Set discovered tax status if not already manually set
            if (expense.getIsTaxDeductible() == null || !expense.getIsTaxDeductible()) {
                expense.setIsTaxDeductible(discovery.getIsTaxDeductible());
            }
        } else if (expense.getCategory().getName() != null) {
            Category category = categoryRepository.findByName(expense.getCategory().getName())
                .orElseGet(() -> categoryRepository.save(new Category(expense.getCategory().getName())));
            expense.setCategory(category);
        }
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id).orElse(null);
    }
}
