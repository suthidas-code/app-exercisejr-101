import { Outlet, NavLink } from 'react-router-dom';
import { BrainCircuit, Image as ImageIcon, PlusCircle } from 'lucide-react';

export default function Layout() {
  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-brand">
          <BrainCircuit size={28} />
          <span>BFA Exercise Space 101</span>
        </div>
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
          >
            <PlusCircle size={20} /> Add Exercise
          </NavLink>
          <NavLink 
            to="/gallery" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <ImageIcon size={20} /> Gallery
          </NavLink>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
