import {
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import type { Question } from "../types/quiz";

interface QuestionListProps {
  questions: Question[];
  onSelectQuestion: (questionId: string) => void;
}

export default function QuestionList({
  questions,
  onSelectQuestion,
}: QuestionListProps) {
  return (
    <List disablePadding>
      {questions.map((question) => (
        <ListItemButton
          key={question.id}
          onClick={() => onSelectQuestion(question.id)}
          divider
          sx={{ gap: 1.5, py: 1.5 }}
        >
          <ListItemText
            primary={question.prompt}
            slotProps={{
              primary: {
                noWrap: true,
                sx: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "2rem",
                },
              },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}
