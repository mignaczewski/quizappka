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

function getQuestionLabel(question: Question): string {
  if (question.title?.trim()) return question.title;
  if (question.prompt?.trim()) return question.prompt;
  switch (question.type) {
    case "meme": return "Meme Question";
    case "singing-pianos": return "Singing Pianos";
    case "image-rebus": return "Image Rebus";
    default: return question.type;
  }
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
            primary={getQuestionLabel(question)}
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
