import React from "react";
import DeployButton from "./DeployButton";
import AuthButton from "./AuthButton";

interface NavBarProps {
  isSupabaseConnected: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ isSupabaseConnected }) => {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 no-print">
      <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
        <DeployButton />
        {isSupabaseConnected && <AuthButton />}
      </div>
    </nav>
  );
};

export default NavBar;
