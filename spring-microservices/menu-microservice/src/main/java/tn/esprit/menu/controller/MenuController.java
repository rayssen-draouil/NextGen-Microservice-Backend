package tn.esprit.menu.controller;

import org.springframework.web.bind.annotation.*;
import tn.esprit.menu.entity.Menu;
import tn.esprit.menu.service.MenuService;

import java.util.List;

@RestController
@RequestMapping("/menus")
public class MenuController {

    private final MenuService service;

    public MenuController(MenuService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public List<Menu> getAll() {
        return service.getAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Menu getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // CREATE
    @PostMapping
    public Menu add(@RequestBody Menu menu) {
        return service.add(menu);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Menu update(@PathVariable Long id, @RequestBody Menu menu) {
        return service.update(id, menu);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
