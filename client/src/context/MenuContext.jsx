import React, { createContext, useContext, useState } from 'react';

const MenuContext = createContext({
  headerMenu: null,
  setHeaderMenu: () => {}
});

export const MenuProvider = ({ children }) => {
  const [headerMenu, setHeaderMenuState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('p_menu');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setHeaderMenu = React.useCallback((menu) => {
    setHeaderMenuState((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(menu)) return prev;
      try {
        if (menu) {
          sessionStorage.setItem('p_menu', JSON.stringify(menu));
        } else {
          sessionStorage.removeItem('p_menu');
        }
      } catch (e) {}
      return menu;
    });
  }, []);

  React.useEffect(() => {
    const fetchDefaultMenu = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/pages/contact-pilot`);
        if (res.ok) {
          const data = await res.json();
          const menu = data?.page?.headerMenu || data?.headerMenu;
          if (menu) setHeaderMenu(menu);
        }
      } catch (err) {
        // Fall back gracefully to default links
      }
    };
    fetchDefaultMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ headerMenu, setHeaderMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
