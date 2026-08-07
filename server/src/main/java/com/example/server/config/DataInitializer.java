package com.example.server.config;

import com.example.server.model.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

/**
 * Retained only for source compatibility with older deployments.
 *
 * DatabaseSeeder is the single source of startup data.  Having two
 * CommandLineRunner beans made their execution order undefined and could
 * leave a deployment with products or categories only partially created.
 */
@Deprecated
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() > 0) {
            return;
        }

        // Seed Users
        User testUser = new User();
        testUser.setName("John Doe");
        testUser.setEmail("user@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole(Role.USER);
        userRepository.save(testUser);

        User adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setRole(Role.ADMIN);
        userRepository.save(adminUser);

        // Seed Categories
        Category electronics = new Category();
        electronics.setName("Electronics");
        categoryRepository.save(electronics);

        Category fashion = new Category();
        fashion.setName("Fashion & Apparel");
        categoryRepository.save(fashion);

        Category homeLiving = new Category();
        homeLiving.setName("Home & Living");
        categoryRepository.save(homeLiving);

        Category sports = new Category();
        sports.setName("Sports & Fitness");
        categoryRepository.save(sports);

        // Seed Products
        // 1. Wireless Headphones
        Product p1 = new Product();
        p1.setName("Ultra Wireless Noise-Canceling Headphones");
        p1.setDescription("Premium active noise-canceling headphones with crystal-clear spatial audio, 40-hour battery life, and ergonomic memory foam earcups.");
        p1.setPrice(199.99);
        p1.setBrand("AcousticMaster");
        p1.setStock(25);
        p1.setCategory(electronics);
        p1.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80");
        p1.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
        ));
        p1.setColors(Arrays.asList("Black", "Silver", "Midnight Blue"));
        p1.setSizes(Arrays.asList("Standard"));
        productRepository.save(p1);

        // 2. Smartwatch Pro
        Product p2 = new Product();
        p2.setName("Pulse Pro Fitness Smartwatch");
        p2.setDescription("Advanced health tracking, ECG monitor, built-in GPS, waterproof design, and 7-day battery power.");
        p2.setPrice(249.50);
        p2.setBrand("PulseTech");
        p2.setStock(18);
        p2.setCategory(electronics);
        p2.setImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80");
        p2.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
        ));
        p2.setColors(Arrays.asList("Space Gray", "Rose Gold", "Silver"));
        p2.setSizes(Arrays.asList("40mm", "44mm"));
        productRepository.save(p2);

        // 3. Leather Jacket
        Product p3 = new Product();
        p3.setName("Classic Vintage Biker Leather Jacket");
        p3.setDescription("Handcrafted 100% genuine lambskin leather jacket with asymmetrical zip front, quilted shoulders, and soft viscose lining.");
        p3.setPrice(189.00);
        p3.setBrand("UrbanRider");
        p3.setStock(12);
        p3.setCategory(fashion);
        p3.setImageUrl("https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80");
        p3.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80"
        ));
        p3.setColors(Arrays.asList("Obsidian Black", "Chestnut Brown"));
        p3.setSizes(Arrays.asList("S", "M", "L", "XL"));
        productRepository.save(p3);

        // 4. Running Shoes
        Product p4 = new Product();
        p4.setName("AeroStride Ultra Lightweight Running Sneakers");
        p4.setDescription("Responsive foam cushioning, breathable knit upper, and high-traction rubber outsole engineered for long-distance comfort.");
        p4.setPrice(129.95);
        p4.setBrand("AeroStride");
        p4.setStock(30);
        p4.setCategory(sports);
        p4.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80");
        p4.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
        ));
        p4.setColors(Arrays.asList("Crimson Red", "Electric Blue", "Stealth Grey"));
        p4.setSizes(Arrays.asList("US 8", "US 9", "US 10", "US 11"));
        productRepository.save(p4);

        // 5. Ergonomic Office Chair
        Product p5 = new Product();
        p5.setName("ErgoFlex Mesh High-Back Executive Chair");
        p5.setDescription("Full lumbar adjustment, 3D armrests, breathable Korean mesh back, and heavy-duty tilt mechanism for 8+ hour comfort.");
        p5.setPrice(299.00);
        p5.setBrand("ErgoFlex");
        p5.setStock(8);
        p5.setCategory(homeLiving);
        p5.setImageUrl("https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80");
        p5.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80"
        ));
        p5.setColors(Arrays.asList("Matte Black", "Light Slate"));
        p5.setSizes(Arrays.asList("Standard"));
        productRepository.save(p5);

        // 6. Minimalist Desk Lamp
        Product p6 = new Product();
        p6.setName("Lumina Touch LED Desk Lamp with Wireless Charger");
        p6.setDescription("Dimmable color temperatures (2700K - 6500K), built-in 15W Qi wireless charging pad, auto-timer, and eye-care diffuser.");
        p6.setPrice(59.99);
        p6.setBrand("Lumina");
        p6.setStock(40);
        p6.setCategory(homeLiving);
        p6.setImageUrl("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80");
        p6.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
        ));
        p6.setColors(Arrays.asList("Arctic White", "Charcoal Black"));
        p6.setSizes(Arrays.asList("Standard"));
        productRepository.save(p6);

        // Seed Reviews
        Review r1 = new Review();
        r1.setProduct(p1);
        r1.setUser(testUser);
        r1.setRating(5);
        r1.setTitle("Phenomenal sound quality!");
        r1.setComment("The noise cancellation is unmatched. Battery life easily lasts throughout my entire work week.");
        reviewRepository.save(r1);

        Review r2 = new Review();
        r2.setProduct(p1);
        r2.setUser(adminUser);
        r2.setRating(4);
        r2.setTitle("Great buy, super comfortable.");
        r2.setComment("Ear cushions are extremely soft. Highly recommended for long flights and work sessions.");
        reviewRepository.save(r2);

        Review r3 = new Review();
        r3.setProduct(p4);
        r3.setUser(testUser);
        r3.setRating(5);
        r3.setTitle("Perfect running shoe!");
        r3.setComment("Extremely lightweight and responsive. Cushioning absorbs impact brilliantly.");
        reviewRepository.save(r3);

        // Update ratings
        p1.setReviews(Arrays.asList(r1, r2));
        p1.updateRating();
        productRepository.save(p1);

        p4.setReviews(Arrays.asList(r3));
        p4.updateRating();
        productRepository.save(p4);
    }
}
