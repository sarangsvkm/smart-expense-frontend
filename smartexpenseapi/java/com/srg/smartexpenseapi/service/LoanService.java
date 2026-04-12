package com.srg.smartexpenseapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.srg.smartexpenseapi.entity.Loan;
import com.srg.smartexpenseapi.entity.User;
import com.srg.smartexpenseapi.repository.LoanRepository;
import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    public List<Loan> getLoansByUser(User user) {
        return loanRepository.findByUser(user);
    }

    public List<Loan> getLoansByUserId(Long userId) {
        return loanRepository.findByUserId(userId);
    }

    public Loan saveLoan(Loan loan) {
        if (loan.getRemainingBalance() == null) {
            loan.setRemainingBalance(loan.getPrincipalAmount());
        }
        return loanRepository.save(loan);
    }

    public void deleteLoan(Long id) {
        loanRepository.deleteById(id);
    }

    public Loan getLoanById(Long id) {
        return loanRepository.findById(id).orElse(null);
    }
}
