import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { getStoredSession, normalizeRole } from '@/services/userApi';

export default function CartPage() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const { items, addItem, decreaseItem, removeItem, clearCart, subtotal, totalQuantity } = useCart();

  if (role !== 'client') {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-3xl font-heading font-bold text-primary">Cart access is limited to clients</h1>
          <p className="mt-3 text-muted-foreground">Switch to a client account to review and place orders.</p>
          <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
            Back to home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-extrabold text-primary">Your cart</h1>
          <p className="text-muted-foreground">{totalQuantity} item(s) ready to checkout</p>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={clearCart} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-primary hover:bg-muted">
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <Icon icon="lucide:shopping-cart" className="mx-auto text-4xl text-muted-foreground" />
          <p className="mt-4 text-lg font-bold text-primary">Your cart is empty</p>
          <p className="text-muted-foreground">Add dishes from a restaurant menu to continue.</p>
          <Link to="/restaurants" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary">{item.name}</h2>
                    <p className="text-sm text-muted-foreground">EUR {Number(item.price || 0).toFixed(2)} each</p>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="rounded-lg bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
                    Remove
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => decreaseItem(item.id)} className="h-8 w-8 rounded-full border border-border bg-background text-primary">-</button>
                    <span className="w-8 text-center font-bold text-primary">{item.quantity}</span>
                    <button type="button" onClick={() => addItem(item)} className="h-8 w-8 rounded-full border border-border bg-background text-primary">+</button>
                  </div>
                  <p className="text-lg font-extrabold text-primary">EUR {(item.quantity * Number(item.price || 0)).toFixed(2)}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6">
            <h3 className="text-2xl font-heading font-bold text-primary">Order summary</h3>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>EUR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span>EUR 2.99</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-lg font-extrabold text-primary">
                <span>Total</span>
                <span>EUR {(subtotal + 2.99).toFixed(2)}</span>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/checkout')} className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 font-bold text-primary-foreground">
              Continue to checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
