package com.dangquocvinh.workflow_backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class DatabaseSchemaFixer {

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void fixSchema() {
        System.out.println("DatabaseSchemaFixer: Starting verification of users table schema...");
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Check if avatar_url column exists in users table
            boolean columnExists = false;
            try (ResultSet rs = conn.getMetaData().getColumns(null, null, "users", "avatar_url")) {
                if (rs.next()) {
                    columnExists = true;
                }
            }
            
            // If it doesn't exist, alter table to add it
            if (!columnExists) {
                System.out.println("DatabaseSchemaFixer: 'avatar_url' column NOT found in 'users' table. Executing ALTER TABLE...");
                stmt.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL");
                System.out.println("DatabaseSchemaFixer: 'avatar_url' column added successfully!");
            } else {
                System.out.println("DatabaseSchemaFixer: 'avatar_url' column already exists in 'users' table.");
            }
            
            // Fix payment_status column to support PARTIALLY_PAID
            try {
                System.out.println("DatabaseSchemaFixer: Modifying appointments.payment_status to VARCHAR(50)...");
                stmt.execute("ALTER TABLE appointments MODIFY COLUMN payment_status VARCHAR(50) NULL");
                System.out.println("DatabaseSchemaFixer: appointments.payment_status column modified successfully!");
            } catch (Exception ex) {
                System.out.println("DatabaseSchemaFixer Warning: Could not alter payment_status column: " + ex.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("DatabaseSchemaFixer Error: Could not verify or alter schema: " + e.getMessage());
            // Safe fallback: we do not block context initialization if there is an error,
            // but for local MySQL it will succeed.
        }
    }
}
