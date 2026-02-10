package tn.esprit.menu;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import tn.esprit.menu.entity.Menu;
import tn.esprit.menu.repository.MenuRepository;

@SpringBootApplication
public class MenuApplication {

    public static void main(String[] args) {
        SpringApplication.run(MenuApplication.class, args);
    }

    @Bean
    CommandLineRunner init(MenuRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Menu("Pizza", "Pizza fromage", 12.5, true));
                repo.save(new Menu("Burger", "Burger poulet", 9.0, true));
            }
        };
    }
}
