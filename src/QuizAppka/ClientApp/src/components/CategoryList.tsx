import { List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { CategorySummary } from '../types/quiz';

interface CategoryListProps {
  categories: CategorySummary[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const navigate = useNavigate();

  if (categories.length === 0) {
    return (
      <Typography color="text.secondary">
        No categories available.
      </Typography>
    );
  }

  return (
    <List>
      {categories.map((cat) => (
        <ListItemButton
          key={cat.id}
          onClick={() => navigate(`/quiz/${cat.id}`)}
          aria-label={cat.name}
        >
          <ListItemText primary={cat.name} />
        </ListItemButton>
      ))}
    </List>
  );
}
