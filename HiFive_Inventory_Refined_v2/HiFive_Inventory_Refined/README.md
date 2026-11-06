# HiFive Inventory — Refined Frontend Prototype

Frontend prototype based on the supplied HiFive Inventory HTML, Figma screen references, logo SVG, navigation SVG set, and eight transparent mascot PNGs.

## Run locally

1. Extract the ZIP file.
2. Open the `HiFive_Inventory_Refined` folder in Visual Studio Code.
3. Install the **Live Server** extension if it is not already installed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. The app opens in your browser.

> Use Live Server or another local web server. Do not open only the ZIP file in VS Code.

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Gudang | `gudang` | `gudang123` |
| Kasir | `kasir` | `kasir123` |

You can also choose **Buat Akun** from the login screen and register a new username with the Admin, Gudang, or Kasir role.

## Updated behavior

- After a successful login, the app opens the **Dashboard** page.
- Desktop sidebar hamburger collapses the sidebar into an icon rail; on smaller screens it opens/closes the drawer.
- Menu-group chevrons expand/collapse menu sections.
- Menu sections start open according to role: **Admin** opens Overview and Preferensi; **Gudang** opens Overview, Kontak, Inventory, and Pembelian; **Kasir** opens Overview, Kontak, and Penjualan. Other sections start collapsed. Users can still expand any section manually.
- Navigation links use the supplied SVG icons in `assets/nav-icons/`.
- Hovering a navigation item animates the pink indicator at the left edge; the active page keeps the indicator visible.
- The bottom-left profile area displays the active username and role. Its chevron opens profile options, and a separate **Logout** control with an exit-door icon is always available below it.
- The top-bar notification bell is a real button. It opens a notification panel; each notification navigates to its related screen, **Tandai dibaca** clears the unread count, and **Lihat semua aktivitas** opens stock history.
- Login, account registration, password visibility, logout, table search, demo add-record modal, CSV export, and a small cashier cart/payment demo are interactive.
- Dashboard and module screens use the HiFive pink/tosca palette and supplied mascot artwork.

## Prototype data and authentication note

This is a browser-only frontend prototype. Demo users, locally registered accounts, notification read state, and temporary UI records are stored in browser storage. Passwords are hashed locally for this prototype, but this is **not production authentication**. A production version must authenticate on the server, enforce role permissions on the backend, and read/write through the existing StockPilot/HiFive API and database.

Most table data, notifications, and dashboard metrics are sample data for interface demonstration. The cashier demo does not post transactions to a real database or permanently decrement inventory.

## Project structure

```text
HiFive_Inventory_Refined/
├── index.html
├── styles.css
├── app.js
├── README.md
└── assets/
    ├── logo/hifive-logo.svg
    ├── mascots/                 # 8 transparent PNG poses
    └── nav-icons/               # supplied navigation SVG icons
```
