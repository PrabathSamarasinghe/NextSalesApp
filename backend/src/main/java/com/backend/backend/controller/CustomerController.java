package com.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.model.Customers;
import com.backend.backend.service.CustomerService;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping("/create")
    public ResponseEntity<String> createCustomer(@RequestBody Customers customer) {
        try {
            customerService.createCustomer(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body("Customer created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Customer creation failed");
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateCustomer(@PathVariable Long id, @RequestBody Customers customer) {
        try {
            System.out.println(customer);
            customerService.updateCustomer(id, customer);
            return ResponseEntity.status(HttpStatus.OK).body("Customer updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Customer update failed");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable Long id) {
        return customerService.deleteCustomer(id);
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<Customers> getCustomerById(@PathVariable Long id) {
        Customers customer = customerService.getCustomerById(id);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/all/{page_number}")
    public ResponseEntity<CustomerService.CustomersResponse> getAllCustomers(@PathVariable int page_number) {
        return customerService.getAllCustomers(page_number);
    }

}
