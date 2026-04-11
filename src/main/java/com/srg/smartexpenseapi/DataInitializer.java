package com.srg.smartexpenseapi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.srg.smartexpenseapi.entity.ERole;
import com.srg.smartexpenseapi.entity.Role;
import com.srg.smartexpenseapi.entity.DebtStrategy;
import com.srg.smartexpenseapi.repository.RoleRepository;
import com.srg.smartexpenseapi.repository.DebtStrategyRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DebtStrategyRepository debtStrategyRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_MODERATOR));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Roles initialized.");
        }

        if (debtStrategyRepository.count() == 0) {
            debtStrategyRepository.save(DebtStrategy.builder()
                .name("AVALANCHE")
                .description("Focuses on paying off debts with the highest interest rates first.")
                .build());
            debtStrategyRepository.save(DebtStrategy.builder()
                .name("SNOWBALL")
                .description("Focuses on paying off debts with the smallest balances first.")
                .build());
            System.out.println("Debt strategies initialized.");
        }
    }
}
