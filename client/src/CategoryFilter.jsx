const CategoryFilter = ({ categories, onSelect }) => {
  return (
    <>
      <select
        name=""
        id="categorySelect"
        className="form-control"
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">All Categorie</option>
        {categories.map(category=>(
            <option key={category.id} value={category.id}>{category.name}</option>
            ))}
      </select>
    </>
  );
};
export default CategoryFilter;
