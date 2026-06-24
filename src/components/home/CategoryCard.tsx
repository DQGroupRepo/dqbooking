import { Link } from "react-router-dom";
import "./CategoryCard.css";

interface Props {
  icon: string;
  title: string;
  description: string;
  link: string;
}

const CategoryCard = ({
  icon,
  title,
  description,
  link
}: Props) => {

  return (

    <Link
      to={link}
      className="category-link"
    >

      <div className="category-card">

        <div className="category-icon">
          {icon}
        </div>

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>

      </div>

    </Link>

  );

};

export default CategoryCard;