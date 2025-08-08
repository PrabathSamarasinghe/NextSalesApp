package com.backend.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SoldItems {
    @Id
    private Long id;
    @OneToOne
    @JoinColumn(name = "issued_invoice_id")
    private IssuedInvoices issuedInvoice;
    @OneToOne
    @JoinColumn(name = "product_id")
    private Products product;
    private Integer quantity;
}
