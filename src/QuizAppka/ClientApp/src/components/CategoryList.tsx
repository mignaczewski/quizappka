import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { CategorySummary } from "../types/quiz";
import { memo, useCallback } from "react";

interface CategoryListProps {
  categories: CategorySummary[];
  isMirror?: boolean;
}

export default function CategoryList({
  categories,
  isMirror,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <Typography color="text.secondary">No categories available.</Typography>
    );
  }

  return (
    <List>
      {categories.map((cat) => (
        <CategoryListItem key={cat.id} category={cat} isMirror={isMirror} />
      ))}
    </List>
  );
}

const CategoryListItem: React.FC<{
  category: CategorySummary;
  isMirror?: boolean;
}> = memo(({ category, isMirror }) => {
  const navigate = useNavigate();

  const onSelectCategory = useCallback(() => {
    !isMirror && navigate(`/quiz/${category.id}`);
  }, [navigate, category.id]);

  return (
    <>
      <ListItemButton
        key={category.id}
        onClick={onSelectCategory}
        aria-label={category.name}
      >
        <ListItemText
          primary={category.name}
          slotProps={{
            primary: { sx: { fontSize: "2rem" } },
          }}
        />
      </ListItemButton>
      <Divider variant="fullWidth" component="li" />
    </>
  );
});
