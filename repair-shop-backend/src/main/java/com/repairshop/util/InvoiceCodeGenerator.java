package com.repairshop.util;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class InvoiceCodeGenerator {
    private static final AtomicInteger counter = new AtomicInteger(0);
    
    public String generate() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("INV-%s-%04d", date, counter.incrementAndGet() % 10000);
    }
}
