import Grid from "@mui/material/Grid";
import { Box, Button, Link, Typography } from "@mui/material";
import type {
  SingingPianosQuestion as SingingPianosQuestionType,
  PianoBox,
  PianoBoxReveal,
  DisplayMode,
} from "../types/quiz";
import { memo } from "react";

function isUrl(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("http://");
}

interface Props {
  question: SingingPianosQuestionType;
  revealedBoxes?: PianoBoxReveal[] | null;
  onBoxReveal?: (boxId: string) => void;
  displayMode?: DisplayMode;
}

export default function SingingPianos({
  question,
  revealedBoxes,
  onBoxReveal,
  displayMode,
}: Props) {
  const isMirror = displayMode === "mirror";
  return (
    <>
      <Typography variant="h2">
        {question.prompt}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container columns={4} spacing={2}>
          <Box
            display={"flex"}
            flexDirection={"row"}
            flexWrap={"wrap"}
            gap={1}
            sx={{ width: "100%" }}
            justifyContent={"space-around"}
            alignItems={"center"}
          >
            {question.boxes.map((box, index) => {
              const isRevealed =
                revealedBoxes?.find((r) => r.id === box.id)?.revealed === true;
              return (
                <SingingPianoTile
                  key={box.id}
                  isRevealed={isRevealed}
                  onBoxReveal={onBoxReveal}
                  box={box}
                  index={index}
                  isMirror={isMirror}
                />
              );
            })}
          </Box>
        </Grid>
      </Box>
      {!isMirror && question.presenterHint && (
        <Typography variant="body2" color="text.secondary" data-testid="presenter-hint" sx={{ mt: 2 }}>
          {isUrl(question.presenterHint) ? (
            <Link href={question.presenterHint} target="_blank" rel="noopener noreferrer">
              {question.presenterHint}
            </Link>
          ) : (
            question.presenterHint
          )}
        </Typography>
      )}
    </>
  );
}

const SingingPianoTile: React.FC<{
  isRevealed: boolean;
  onBoxReveal?: (boxId: string) => void;
  box: PianoBox;
  index: number;
  isMirror: boolean;
}> = memo(({ isRevealed, onBoxReveal, box, index, isMirror }) => {
  return (
    <Box width="25%" marginBottom="48px">
      <Button
        fullWidth
        variant={isRevealed ? "contained" : "outlined"}
        onClick={() => !isRevealed && !isMirror && onBoxReveal?.(box.id)}
        data-testid={`piano-box-${index}`}
        sx={{
          minHeight: 200,
          fontSize: "2rem",
        }}
      >
        {isRevealed ? (
          box.hiddenText
        ) : (
          <span style={{ fontSize: "3.5rem" }}>𝄞</span>
        )}
      </Button>
    </Box>
  );
});
