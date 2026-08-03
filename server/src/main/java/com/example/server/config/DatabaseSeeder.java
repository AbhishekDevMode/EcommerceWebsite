package com.example.server.config;

import com.example.server.model.*;
import com.example.server.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public DatabaseSeeder(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            ReviewRepository reviewRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            logger.info("Database already contains product data (count: {}). Skipping seeding.", productRepository.count());
            return;
        }

        logger.info("Seeding initial product catalog and categories into database...");

        // Seed Categories if missing
        Category electronics = categoryRepository.findByName("Electronics")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Electronics");
                    return categoryRepository.save(cat);
                });

        Category fashion = categoryRepository.findByName("Fashion & Apparel")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Fashion & Apparel");
                    return categoryRepository.save(cat);
                });

        Category homeLiving = categoryRepository.findByName("Home & Living")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Home & Living");
                    return categoryRepository.save(cat);
                });

        Category sports = categoryRepository.findByName("Sports & Fitness")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Sports & Fitness");
                    return categoryRepository.save(cat);
                });

        // 1. Ultra Wireless Headphones
        Product p1 = new Product();
        p1.setName("Ultra Wireless Noise-Canceling Headphones");
        p1.setSlug("ultra-wireless-noise-canceling-headphones");
        p1.setDescription("Premium active noise-canceling headphones with crystal-clear spatial audio, 40-hour battery life, and ergonomic memory foam earcups.");
        p1.setBasePriceCents(19999);
        p1.setBrand("AcousticMaster");
        p1.setStock(25);
        p1.setIsActive(true);
        p1.setCategory(electronics);
        p1.setColors(Arrays.asList("Black", "Silver", "Midnight Blue"));
        p1.setSizes(Arrays.asList("Standard"));

        p1.addImage(new ProductImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "Main Headphones Angle", true, 1));
        p1.addImage(new ProductImage("https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80", "Side View", false, 2));
        p1.addImage(new ProductImage("https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80", "Folded in Case", false, 3));

        p1.addVariant(new ProductVariant("ACOU-HD-BLK", 19999, 15, "{\"color\":\"Black\"}"));
        p1.addVariant(new ProductVariant("ACOU-HD-SLV", 19999, 10, "{\"color\":\"Silver\"}"));
        productRepository.save(p1);

        // 2. Fitness Smartwatch
        Product p2 = new Product();
        p2.setName("Pulse Pro Fitness Smartwatch");
        p2.setSlug("pulse-pro-fitness-smartwatch");
        p2.setDescription("Advanced health tracking, ECG monitor, built-in GPS, waterproof design, and 7-day battery power.");
        p2.setBasePriceCents(24950);
        p2.setBrand("PulseTech");
        p2.setStock(18);
        p2.setIsActive(true);
        p2.setCategory(electronics);
        p2.setColors(Arrays.asList("Space Gray", "Rose Gold", "Silver"));
        p2.setSizes(Arrays.asList("40mm", "44mm"));

        p2.addImage(new ProductImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", "Smartwatch Front", true, 1));
        p2.addImage(new ProductImage("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80", "Wrist Angle", false, 2));

        p2.addVariant(new ProductVariant("PULSE-SW-40", 24950, 10, "{\"size\":\"40mm\",\"color\":\"Space Gray\"}"));
        p2.addVariant(new ProductVariant("PULSE-SW-44", 26950, 8, "{\"size\":\"44mm\",\"color\":\"Space Gray\"}"));
        productRepository.save(p2);

        // 3. Vintage Biker Leather Jacket
        Product p3 = new Product();
        p3.setName("Classic Vintage Biker Leather Jacket");
        p3.setSlug("classic-vintage-biker-leather-jacket");
        p3.setDescription("Handcrafted 100% genuine lambskin leather jacket with asymmetrical zip front, quilted shoulders, and soft viscose lining.");
        p3.setBasePriceCents(18900);
        p3.setBrand("UrbanRider");
        p3.setStock(12);
        p3.setIsActive(true);
        p3.setCategory(fashion);
        p3.setColors(Arrays.asList("Obsidian Black", "Chestnut Brown"));
        p3.setSizes(Arrays.asList("S", "M", "L", "XL"));

        p3.addImage(new ProductImage("https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", "Leather Jacket Front", true, 1));
        p3.addImage(new ProductImage("https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80", "Jacket Model Angle", false, 2));

        p3.addVariant(new ProductVariant("URBAN-JK-M", 18900, 6, "{\"size\":\"M\",\"color\":\"Obsidian Black\"}"));
        p3.addVariant(new ProductVariant("URBAN-JK-L", 18900, 6, "{\"size\":\"L\",\"color\":\"Obsidian Black\"}"));
        productRepository.save(p3);

        // 4. AeroStride Running Sneakers
        Product p4 = new Product();
        p4.setName("AeroStride Ultra Lightweight Running Sneakers");
        p4.setSlug("aerostride-ultra-lightweight-running-sneakers");
        p4.setDescription("Responsive foam cushioning, breathable knit upper, and high-traction rubber outsole engineered for long-distance comfort.");
        p4.setBasePriceCents(12995);
        p4.setBrand("AeroStride");
        p4.setStock(30);
        p4.setIsActive(true);
        p4.setCategory(sports);
        p4.setColors(Arrays.asList("Crimson Red", "Electric Blue", "Stealth Grey"));
        p4.setSizes(Arrays.asList("US 8", "US 9", "US 10", "US 11"));

        p4.addImage(new ProductImage("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", "Red Sneaker Lateral View", true, 1));
        p4.addImage(new ProductImage("https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80", "Pair Angle View", false, 2));

        p4.addVariant(new ProductVariant("AERO-SNK-9", 12995, 15, "{\"size\":\"US 9\",\"color\":\"Crimson Red\"}"));
        p4.addVariant(new ProductVariant("AERO-SNK-10", 12995, 15, "{\"size\":\"US 10\",\"color\":\"Crimson Red\"}"));
        productRepository.save(p4);

        // 5. ErgoFlex Executive Chair
        Product p5 = new Product();
        p5.setName("ErgoFlex Mesh High-Back Executive Chair");
        p5.setSlug("ergoflex-mesh-high-back-executive-chair");
        p5.setDescription("Full lumbar adjustment, 3D armrests, breathable Korean mesh back, and heavy-duty tilt mechanism for 8+ hour comfort.");
        p5.setBasePriceCents(29900);
        p5.setBrand("ErgoFlex");
        p5.setStock(8);
        p5.setIsActive(true);
        p5.setCategory(homeLiving);
        p5.setColors(Arrays.asList("Matte Black", "Light Slate"));
        p5.setSizes(Arrays.asList("Standard"));

        p5.addImage(new ProductImage("https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80", "Office Chair Front", true, 1));

        p5.addVariant(new ProductVariant("ERGO-CHR-BLK", 29900, 8, "{\"color\":\"Matte Black\"}"));
        productRepository.save(p5);

        // 6. Lumina LED Desk Lamp
        Product p6 = new Product();
        p6.setName("Lumina Touch LED Desk Lamp with Wireless Charger");
        p6.setSlug("lumina-touch-led-desk-lamp-with-wireless-charger");
        p6.setDescription("Dimmable color temperatures (2700K - 6500K), built-in 15W Qi wireless charging pad, auto-timer, and eye-care diffuser.");
        p6.setBasePriceCents(5999);
        p6.setBrand("Lumina");
        p6.setStock(40);
        p6.setIsActive(true);
        p6.setCategory(homeLiving);
        p6.setColors(Arrays.asList("Arctic White", "Charcoal Black"));
        p6.setSizes(Arrays.asList("Standard"));

        p6.addImage(new ProductImage("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", "Desk Lamp Lit", true, 1));

        p6.addVariant(new ProductVariant("LUM-LMP-WHT", 5999, 40, "{\"color\":\"Arctic White\"}"));
        productRepository.save(p6);

        logger.info("Successfully seeded database with {} initial products.", productRepository.count());
    }
}
