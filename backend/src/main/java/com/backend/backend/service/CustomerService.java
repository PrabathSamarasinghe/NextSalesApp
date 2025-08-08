package com.backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.backend.backend.model.Customers;
import com.backend.backend.repository.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public ResponseEntity<String> createCustomer(Customers customer) {
        try {
            customerRepository.save(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body("Customer created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Customer creation failed");
        }
    }

    public Customers[] getAllCustomers() {
        try {
            return customerRepository.findAll().toArray(new Customers[0]);
        } catch (Exception e) {
            e.printStackTrace();
            return new Customers[0];
        }
    }

    public ResponseEntity<String> updateCustomer(Long id, Customers customer) {
        try {
            if (!customerRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }
            Customers existingCustomer = customerRepository.findById(id).orElseThrow();
            existingCustomer.setName(customer.getName());
            existingCustomer.setAddress(customer.getAddress());
            existingCustomer.setEmail(customer.getEmail());
            existingCustomer.setPhoneNumber(customer.getPhoneNumber());
            existingCustomer.setEpfNumber(customer.getEpfNumber());
            customerRepository.save(existingCustomer);
            return ResponseEntity.status(HttpStatus.OK).body("Customer updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Customer update failed");
        }
    }
    public ResponseEntity<String> deleteCustomer(Long id) {
        try {
            customerRepository.deleteById(id);
            return ResponseEntity.status(HttpStatus.OK).body("Customer deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Customer deletion failed");
        }
    }

    public Customers getCustomerById(Long id) {
        try {
            return customerRepository.findById(id).orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
