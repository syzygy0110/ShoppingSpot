import { createContext, useContext, useReducer, ReactNode } from "react";
import { CartItem, Product } from "@shared/schema";

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "UPDATE_QUANTITY"; id: number; quantity: number }
  | { type: "REMOVE_ITEM"; id: number }
  | { type: "CLEAR" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({ state: { items: [], total: 0 }, dispatch: () => null });

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.item],
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    case "CLEAR":
      return { items: [], total: 0 };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
