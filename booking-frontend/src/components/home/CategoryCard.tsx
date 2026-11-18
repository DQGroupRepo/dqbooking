import { Link } from "react-router-dom";
import "./CategoryCard.css";

interface Props {
  icon: string;
  title: string;
  category: string;
  description: string;
  link: string;
}

const CategoryCard = ({
  icon,
  title,
  category,
  description,
  link
}: Props) => {

  return (

    <Link
      to={`${link}?category=${encodeURIComponent(category)}`}
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