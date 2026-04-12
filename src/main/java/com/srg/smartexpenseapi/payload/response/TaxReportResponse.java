package com.srg.smartexpenseapi.payload.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class TaxReportResponse {
    private String itrType;
    private Double totalSalaryIncome;
    private Double totalBusinessIncome;
    private Double totalCapitalGains;
    private Double totalOtherIncome;
    private Double totalDeductions;
    private Double netTaxableIncome;
    private Double estimatedTax; // This will show the recommended (lower) tax
    private Double estimatedTaxOldRegime;
    private Double estimatedTaxNewRegime;
    private String recommendedRegime;
    private String taxBracket;
    private Map<String, Double> incomeBreakdown;
    private Map<String, Double> capitalGainsBreakdown;
}
