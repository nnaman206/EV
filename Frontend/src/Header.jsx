import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <div>
      <header className="flex justify-between items-center px-10 py-4">
        <p className="text-gray-500 text-xl">Company Name</p>

        <nav className="space-x-5">
          <ul className="flex gap-6">
            <li>
              <Link
                to="/register-admin"
                className="text-gray-500 text-xl cursor-pointer hover:text-2xl transition-all duration-200"
              >
                Admin
              </Link>
            </li>
            <li>
              <Link
                to="/register-user"
                className="text-gray-500 text-xl cursor-pointer hover:text-2xl transition-all duration-200"
              >
                Consumer
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}

export default Header;
