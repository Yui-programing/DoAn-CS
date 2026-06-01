// Component button dùng chung
import './CommonButton.css';

interface CommonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const CommonButton = ({ children, onClick, className }: CommonButtonProps) => {
  return (
    <button onClick={onClick} className={`common-button ${className || ''}`}>
      {children}
    </button>
  );
};

export default CommonButton;
