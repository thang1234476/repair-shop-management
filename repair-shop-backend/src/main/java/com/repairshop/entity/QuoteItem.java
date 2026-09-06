package com.repairshop.entity;
import com.repairshop.enums.QuoteItemType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "quote_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuoteItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quote_item_id") private Integer quoteItemId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false) private Quote quote;
    @Enumerated(EnumType.STRING) @Column(name = "item_type", nullable = false) private QuoteItemType itemType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id") private Part part;
    @Column(name = "description", nullable = false) private String description;
    @Column(name = "quantity", nullable = false) private Integer quantity;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    // subtotal is GENERATED ALWAYS in DB, do NOT insert it
    @Column(name = "subtotal", insertable = false, updatable = false, precision = 12, scale = 2) private BigDecimal subtotal;
}
