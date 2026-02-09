package tn.esprit.menu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.menu.entity.Menu;

public interface MenuRepository extends JpaRepository<Menu, Long> {
}
