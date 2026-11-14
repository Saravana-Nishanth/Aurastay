import { Link, NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand">
          <img src="/hotel.svg" alt="" width="30" height="30" />
          <span>AuraStay</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end className={linkClass}>
            Hotels
          </NavLink>
          <NavLink to="/hotels/add" className={linkClass}>
            Add Hotel
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
