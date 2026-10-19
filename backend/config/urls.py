from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import SimpleRouter
from shop import views

router = SimpleRouter()
router.register("products", views.ProductViewSet, basename="product")
router.register("admin/products", views.AdminProductViewSet, basename="admin-product")
router.register("admin/categories", views.AdminCategoryViewSet, basename="admin-category")
router.register("admin/orders", views.AdminOrderViewSet, basename="admin-order")
urlpatterns = [
    path("api/", include(router.urls)),
    path("api/categories/", views.CategoryList.as_view()),
    path("api/auth/register/", views.RegisterView.as_view()),
    path("api/auth/login/", views.AuthView.as_view()),
    path("api/auth/logout/", views.LogoutView.as_view()),
    path("api/auth/me/", views.MeView.as_view()),
    path("api/cart/", views.CartView.as_view()),
    path("api/cart/items/", views.CartItemsView.as_view()),
    path("api/cart/items/<int:pk>/", views.CartItemView.as_view()),
    path("api/orders/", views.OrdersView.as_view()),
    path("api/orders/<int:pk>/", views.OrderDetail.as_view()),
]
# Local development only; deployments must serve MEDIA_ROOT through their media server.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
