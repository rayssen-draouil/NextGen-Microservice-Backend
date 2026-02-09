package tn.esprit.menu.service;

import org.springframework.stereotype.Service;
import tn.esprit.menu.entity.Menu;
import tn.esprit.menu.repository.MenuRepository;

import java.util.List;

@Service
public class MenuService {

    private final MenuRepository repo;

    public MenuService(MenuRepository repo) {
        this.repo = repo;
    }

    public List<Menu> getAll() {
        return repo.findAll();
    }

    public Menu getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Menu add(Menu menu) {
        return repo.save(menu);
    }

    public Menu update(Long id, Menu menu) {
        Menu m = repo.findById(id).orElse(null);
        if (m != null) {
            m.setNom(menu.getNom());
            m.setDescription(menu.getDescription());
            m.setPrix(menu.getPrix());
            m.setDisponible(menu.isDisponible());
            return repo.save(m);
        }
        return null;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
