package com.example.server.config;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.model.Category;
import com.example.server.model.Product;
import com.example.server.model.Review;
import com.example.server.model.Role;
import com.example.server.model.User;
import com.example.server.repository.CategoryRepository;
import com.example.server.repository.ProductRepository;
import com.example.server.repository.ReviewRepository;
import com.example.server.repository.UserRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Seed default Users if not present
        User testUser = userRepository.findByEmail("user@example.com").orElseGet(() -> {
            User u = new User();
            u.setName("John Doe");
            u.setEmail("user@example.com");
            u.setPassword(passwordEncoder.encode("password123"));
            u.setRole(Role.USER);
            return userRepository.save(u);
        });

        User adminUser = userRepository.findByEmail("admin@example.com").orElseGet(() -> {
            User u = new User();
            u.setName("Admin User");
            u.setEmail("admin@example.com");
            u.setPassword(passwordEncoder.encode("admin123"));
            u.setRole(Role.ADMIN);
            return userRepository.save(u);
        });

        // Seed Categories if missing
        Category electronics = categoryRepository.findByName("Electronics").orElseGet(() -> {
            Category cat = new Category();
            cat.setName("Electronics");
            return categoryRepository.save(cat);
        });

        Category fashion = categoryRepository.findByName("Fashion & Apparel").orElseGet(() -> {
            Category cat = new Category();
            cat.setName("Fashion & Apparel");
            return categoryRepository.save(cat);
        });

        Category homeLiving = categoryRepository.findByName("Home & Living").orElseGet(() -> {
            Category cat = new Category();
            cat.setName("Home & Living");
            return categoryRepository.save(cat);
        });

        Category sports = categoryRepository.findByName("Sports & Fitness").orElseGet(() -> {
            Category cat = new Category();
            cat.setName("Sports & Fitness");
            return categoryRepository.save(cat);
        });

        if (productRepository.count() > 0) {
            logger.info("Database already contains {} products. Seeding completed.", productRepository.count());
            return;
        }

        logger.info("Seeding initial product catalog into database...");

        // 1. Ultra Wireless Headphones
        Product p1 = new Product();
        p1.setName("Ultra Wireless Noise-Canceling Headphones");
        p1.setSlug("ultra-wireless-noise-canceling-headphones");
        p1.setDescription("Premium active noise-canceling headphones with crystal-clear spatial audio, 40-hour battery life, and ergonomic memory foam earcups.");
        p1.setPrice(199.99);
        p1.setBasePriceCents(19999);
        p1.setBrand("AcousticMaster");
        p1.setStock(25);
        p1.setIsActive(true);
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

        // 2. Fitness Smartwatch
        Product p2 = new Product();
        p2.setName("Pulse Pro Fitness Smartwatch");
        p2.setSlug("pulse-pro-fitness-smartwatch");
        p2.setDescription("Advanced health tracking, ECG monitor, built-in GPS, waterproof design, and 7-day battery power.");
        p2.setPrice(249.50);
        p2.setBasePriceCents(24950);
        p2.setBrand("PulseTech");
        p2.setStock(18);
        p2.setIsActive(true);
        p2.setCategory(electronics);
        p2.setImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80");
        p2.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
        ));
        p2.setColors(Arrays.asList("Space Gray", "Rose Gold", "Silver"));
        p2.setSizes(Arrays.asList("40mm", "44mm"));
        productRepository.save(p2);

        // 3. Vintage Biker Leather Jacket
        Product p3 = new Product();
        p3.setName("Classic Vintage Biker Leather Jacket");
        p3.setSlug("classic-vintage-biker-leather-jacket");
        p3.setDescription("Handcrafted 100% genuine lambskin leather jacket with asymmetrical zip front, quilted shoulders, and soft viscose lining.");
        p3.setPrice(189.00);
        p3.setBasePriceCents(18900);
        p3.setBrand("UrbanRider");
        p3.setStock(12);
        p3.setIsActive(true);
        p3.setCategory(fashion);
        p3.setImageUrl("https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80");
        p3.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80"
        ));
        p3.setColors(Arrays.asList("Obsidian Black", "Chestnut Brown"));
        p3.setSizes(Arrays.asList("S", "M", "L", "XL"));
        productRepository.save(p3);

        // 4. AeroStride Running Sneakers
        Product p4 = new Product();
        p4.setName("AeroStride Ultra Lightweight Running Sneakers");
        p4.setSlug("aerostride-ultra-lightweight-running-sneakers");
        p4.setDescription("Responsive foam cushioning, breathable knit upper, and high-traction rubber outsole engineered for long-distance comfort.");
        p4.setPrice(129.95);
        p4.setBasePriceCents(12995);
        p4.setBrand("AeroStride");
        p4.setStock(30);
        p4.setIsActive(true);
        p4.setCategory(sports);
        p4.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80");
        p4.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
        ));
        p4.setColors(Arrays.asList("Crimson Red", "Electric Blue", "Stealth Grey"));
        p4.setSizes(Arrays.asList("US 8", "US 9", "US 10", "US 11"));
        productRepository.save(p4);

        // 5. ErgoFlex Executive Chair
        Product p5 = new Product();
        p5.setName("ErgoFlex Mesh High-Back Executive Chair");
        p5.setSlug("ergoflex-mesh-high-back-executive-chair");
        p5.setDescription("Full lumbar adjustment, 3D armrests, breathable Korean mesh back, and heavy-duty tilt mechanism for 8+ hour comfort.");
        p5.setPrice(299.00);
        p5.setBasePriceCents(29900);
        p5.setBrand("ErgoFlex");
        p5.setStock(8);
        p5.setIsActive(true);
        p5.setCategory(homeLiving);
        p5.setImageUrl("https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80");
        p5.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80"
        ));
        p5.setColors(Arrays.asList("Matte Black", "Light Slate"));
        p5.setSizes(Arrays.asList("Standard"));
        productRepository.save(p5);

        // 6. Lumina LED Desk Lamp
        Product p6 = new Product();
        p6.setName("Lumina Touch LED Desk Lamp with Wireless Charger");
        p6.setSlug("lumina-touch-led-desk-lamp-with-wireless-charger");
        p6.setDescription("Dimmable color temperatures (2700K - 6500K), built-in 15W Qi wireless charging pad, auto-timer, and eye-care diffuser.");
        p6.setPrice(59.99);
        p6.setBasePriceCents(5999);
        p6.setBrand("Lumina");
        p6.setStock(40);
        p6.setIsActive(true);
        p6.setCategory(homeLiving);
        p6.setImageUrl("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80");
        p6.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
        ));
        p6.setColors(Arrays.asList("Arctic White", "Charcoal Black"));
        p6.setSizes(Arrays.asList("Standard"));
        productRepository.save(p6);

        // Seed sample reviews
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

        p1.setReviews(Arrays.asList(r1, r2));
        p1.updateRating();
        productRepository.save(p1);

        logger.info("Successfully seeded database with {} initial products.", productRepository.count());
    }
}
