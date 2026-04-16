[README.md](https://github.com/user-attachments/files/26769728/README.md)
# NextGen Microservices Backend

Backend microservices Spring Boot pour Foodly, avec découverte Eureka, centralisation via API Gateway, communication OpenFeign et front Vite.

## Architecture

- Eureka Server: `http://localhost:8761`
- Config Server: `http://localhost:8585`
- API Gateway: `http://localhost:3000` en local, `http://localhost:16604` dans Docker Compose
- Frontend: `http://localhost:4173`
- Keycloak: `http://localhost:16567`

Services principaux:

- `order-microservice` sur `8083`, Eureka name `ORDER`
- `delivery-microservice` sur `8084`, Eureka name `LIVRAISON`
- `restaurant-microservice` sur `8081`, Eureka name `RESTAURANT`
- `avis-microservice` sur `8085`, Eureka name `AVIS`
- `menu-microservice` sur `8092`, Eureka name `MENU`
- `user-microservice` sur `3000` dans son propre conteneur, exposé sur `3001` en local via Docker Compose
- `APIGatewayMain` sur `3000` en local, exposé sur `16604` via Docker Compose

## Arborescence

- `APIGatewayMain/`: Spring Cloud Gateway
- `avis-microservice/`: microservice avis / réclamations
- `delivery-microservice/`: microservice livraison
- `menu-microservice/`: microservice menu
- `order-microservice/`: microservice commande
- `restaurant-microservice/`: microservice restaurant
- `user-microservice/`: backend NestJS pour l’authentification et les utilisateurs
- `foodly_front/`: frontend Vite
- `docker-compose.yml`: orchestration locale
- `keycloak/`: configuration Keycloak
- `mysql/`, `rabbitmq/`, `Database/`: ressources d’infrastructure et données

## Démarrage local

L’ordre conseillé est le suivant:

1. `EurekaServer`
2. `ConfigSever`
3. `mysql`, `rabbitmq`, `keycloak`
4. `restaurant-microservice`, `menu-microservice`, `order-microservice`, `delivery-microservice`, `avis-microservice`
5. `APIGatewayMain`
6. `foodly_front`

Avec Docker Compose, la stack complète peut être lancée depuis la racine du projet:

```bash
docker compose up --build
```

## URLs utiles

| Service | URL locale | URL Docker |
|---|---|---|
| Gateway | `http://localhost:3000` | `http://localhost:16604` |
| Frontend | `http://localhost:4173` | `http://localhost:4173` |
| Eureka | `http://localhost:8761` | `http://localhost:8761` |
| Keycloak | `http://localhost:16567` | `http://localhost:16567` |

## Routes Gateway

| Service | Prefix |
|---|---|
| Order | `/order/**` |
| Delivery | `/delivery/**`, `/livraisons/**` |
| Restaurant | `/restaurants/**` |
| Avis | `/reclamations/**` |
| Menu | `/menus/**` |

## Exemples d’API

### Menu

- `GET /menus`
- `GET /menus/{id}`
- `POST /menus`
- `PUT /menus/{id}`
- `DELETE /menus/{id}`

### Order

- `POST /order`
- `GET /order`
- `GET /order/{id}`

### Delivery

- `POST /livraisons`
- `GET /delivery/orders`
- `GET /delivery/order/{id}`

### Restaurant

- `POST /restaurants`
- `GET /restaurants`
- `GET /restaurants/{id}`

### Avis

- `POST /reclamations`
- `GET /reclamations`
- `GET /reclamations/{id}`

## Notes

- Le service `order-microservice` utilise une base H2 en mémoire, donc les données sont perdues au redémarrage.
- Le gateway Spring est configuré pour passer par Eureka et le Config Server.
- Le frontend pointe vers l’API Gateway via `VITE_API_BASE_URL`.

## Vérification rapide

Pour tester le démarrage, ouvrez d’abord Eureka puis le gateway. Si les services sont bien enregistrés, ils doivent apparaître dans le dashboard Eureka.
|---|---|---|---|---|
| Order | Delivery | `GET` | `/order/delivery/{id}` | Get delivery by ID |
| Order | Delivery | `GET` | `/order/deliveries` | Get all deliveries |
| Delivery | Order | `GET` | `/delivery/order/{id}` | Get order by ID |
| Delivery | Order | `GET` | `/delivery/orders` | Get all orders |
| Avis | Restaurant | `GET` | `/reclamations/{id}/restaurant` | Get restaurant for a given reclamation |
| Avis | Restaurant | `GET` | `/reclamations/restaurants` | Get all restaurants |
| Restaurant | Avis | `GET` | `/restaurants/reclamation/{id}` | Get reclamation by ID |
| Restaurant | Avis | `GET` | `/restaurants/reclamations` | Get all reclamations |
| Restaurant | Order | `GET` | `/restaurants/order/{id}` | Get order by ID |
| Restaurant | Order | `GET` | `/restaurants/orders` | Get all orders |
| Menu | Order | `GET` | `/menus/orders/{id}` | Get order by ID |
| Menu | Order | `GET` | `/menus/orders` | Get all orders |
| Order | Menu | `GET` | `/order/menus/{id}` | Get menu item by ID |
| Order | Menu | `GET` | `/order/menus` | Get all menu items |
