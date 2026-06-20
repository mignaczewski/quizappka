using System.Text.Json;
using QuizAppka.Models;

namespace QuizAppka.Tests.Models;

public class QuestionSerializationTests
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    [Fact]
    public void ClosedQuestion_WithPresenterHint_SerializesAndDeserializesCorrectly()
    {
        var question = new ClosedQuestion
        {
            Id = "q1",
            Prompt = "Which planet is closest to the Sun?",
            Options = [new AnswerOption { Id = "a", Text = "Mercury" }],
            PresenterHint = "Mercury is the answer.",
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var closed = Assert.IsType<ClosedQuestion>(deserialized);
        Assert.Equal("Mercury is the answer.", closed.PresenterHint);
    }

    [Fact]
    public void ClosedQuestion_WithoutPresenterHint_HasNullHint()
    {
        var question = new ClosedQuestion
        {
            Id = "q1",
            Prompt = "Question?",
            Options = [],
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var closed = Assert.IsType<ClosedQuestion>(deserialized);
        Assert.Null(closed.PresenterHint);
    }

    [Fact]
    public void MemeQuestion_SerializesAndDeserializesCorrectly()
    {
        var question = new MemeQuestion
        {
            Id = "q2",
            Prompt = "Meme?",
            EntryImage = "entry.jpg",
            RevealImage = "reveal.jpg",
            Options = [new AnswerOption { Id = "a", Text = "Option A" }],
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var meme = Assert.IsType<MemeQuestion>(deserialized);
        Assert.Equal("entry.jpg", meme.EntryImage);
        Assert.Equal("reveal.jpg", meme.RevealImage);
        Assert.Single(meme.Options);
    }

    [Fact]
    public void SingingPianosQuestion_SerializesAndDeserializesCorrectly()
    {
        var question = new SingingPianosQuestion
        {
            Id = "q3",
            Prompt = "Piano?",
            Boxes =
            [
                new PianoBox { Id = "box1", HiddenText = "DO" },
                new PianoBox { Id = "box2", HiddenText = "RE" },
            ],
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var pianos = Assert.IsType<SingingPianosQuestion>(deserialized);
        Assert.Equal(2, pianos.Boxes.Length);
        Assert.Equal("DO", pianos.Boxes[0].HiddenText);
    }

    [Fact]
    public void TimedOpenQuestion_SerializesAndDeserializesCorrectly()
    {
        var question = new TimedOpenQuestion
        {
            Id = "q6",
            Prompt = "Name three planets",
            InitialDurationSeconds = 60,
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var timed = Assert.IsType<TimedOpenQuestion>(deserialized);
        Assert.Equal(60, timed.InitialDurationSeconds);
    }

    [Fact]
    public void RevealState_SerializesAndDeserializesCorrectly()
    {
        var state = new RevealState(MemeImageRevealed: true, SingingPianosBoxesRevealed: [new PianoBoxReveal("box1", true), new PianoBoxReveal("box2", false), new PianoBoxReveal("box3", true)]);

        var json = JsonSerializer.Serialize(state, Options);
        var deserialized = JsonSerializer.Deserialize<RevealState>(json, Options);

        Assert.NotNull(deserialized);
        Assert.True(deserialized.MemeImageRevealed);
        Assert.Equal(3, deserialized.SingingPianosBoxesRevealed!.Length);
        Assert.Equal("box1", deserialized.SingingPianosBoxesRevealed[0].Id);
        Assert.True(deserialized.SingingPianosBoxesRevealed[0].Revealed);
        Assert.Equal("box2", deserialized.SingingPianosBoxesRevealed[1].Id);
        Assert.False(deserialized.SingingPianosBoxesRevealed[1].Revealed);
    }

    [Fact]
    public void MemeQuestion_WithPresenterHint_SerializesAndDeserializesCorrectly()
    {
        var question = new MemeQuestion
        {
            Id = "q1",
            Prompt = "Which meme?",
            EntryImage = "entry.jpg",
            Options = [],
            PresenterHint = "Scoring note for presenter.",
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var meme = Assert.IsType<MemeQuestion>(deserialized);
        Assert.Equal("Scoring note for presenter.", meme.PresenterHint);
        Assert.Contains("\"presenterHint\"", json);
    }

    [Fact]
    public void MemeQuestion_WithoutPresenterHint_HintIsAbsentFromJson()
    {
        var question = new MemeQuestion
        {
            Id = "q1",
            Prompt = "Which meme?",
            EntryImage = "entry.jpg",
            Options = [],
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var meme = Assert.IsType<MemeQuestion>(deserialized);
        Assert.Null(meme.PresenterHint);
        Assert.DoesNotContain("\"presenterHint\"", json);
    }

    [Fact]
    public void SingingPianosQuestion_WithPresenterHint_SerializesAndDeserializesCorrectly()
    {
        var question = new SingingPianosQuestion
        {
            Id = "q1",
            Prompt = "Reveal!",
            Boxes = [new PianoBox { Id = "b1", HiddenText = "DO" }],
            PresenterHint = "All You Need Is Love",
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var pianos = Assert.IsType<SingingPianosQuestion>(deserialized);
        Assert.Equal("All You Need Is Love", pianos.PresenterHint);
        Assert.Contains("\"presenterHint\"", json);
    }

    [Fact]
    public void SingingPianosQuestion_WithoutPresenterHint_HintIsAbsentFromJson()
    {
        var question = new SingingPianosQuestion
        {
            Id = "q1",
            Prompt = "Reveal!",
            Boxes = [],
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        var pianos = Assert.IsType<SingingPianosQuestion>(deserialized);
        Assert.Null(pianos.PresenterHint);
        Assert.DoesNotContain("\"presenterHint\"", json);
    }

    [Theory]
    [InlineData("open")]
    [InlineData("closed")]
    [InlineData("meme")]
    [InlineData("singing-pianos")]
    [InlineData("image-rebus")]
    public void Question_WithTitle_TitleRoundTripsCorrectly(string type)
    {
        Question question = type switch
        {
            "open" => new OpenQuestion { Id = "q1", Prompt = "Open?", Title = "Open Title" },
            "closed" => new ClosedQuestion { Id = "q1", Prompt = "Closed?", Title = "Closed Title", Options = [] },
            "meme" => new MemeQuestion { Id = "q1", Prompt = "Meme?", Title = "Meme Title", EntryImage = "e.jpg", Options = [] },
            "singing-pianos" => new SingingPianosQuestion { Id = "q1", Prompt = "Piano?", Title = "Piano Title", Boxes = [] },
            "image-rebus" => new ImageRebusQuestion { Id = "q1", Prompt = "Rebus?", Title = "Rebus Title", ImageRef = "r.png" },
            _ => throw new InvalidOperationException(),
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        Assert.NotNull(deserialized);
        Assert.Equal("Title", deserialized.Title?.Split(' ')[1]);
        Assert.Contains("\"title\"", json);
    }

    [Theory]
    [InlineData("open")]
    [InlineData("closed")]
    [InlineData("meme")]
    [InlineData("singing-pianos")]
    [InlineData("image-rebus")]
    public void Question_WithoutTitle_TitleIsAbsentFromJson(string type)
    {
        Question question = type switch
        {
            "open" => new OpenQuestion { Id = "q1", Prompt = "Open?" },
            "closed" => new ClosedQuestion { Id = "q1", Prompt = "Closed?", Options = [] },
            "meme" => new MemeQuestion { Id = "q1", Prompt = "Meme?", EntryImage = "e.jpg", Options = [] },
            "singing-pianos" => new SingingPianosQuestion { Id = "q1", Prompt = "Piano?", Boxes = [] },
            "image-rebus" => new ImageRebusQuestion { Id = "q1", Prompt = "Rebus?", ImageRef = "r.png" },
            _ => throw new InvalidOperationException(),
        };

        var json = JsonSerializer.Serialize<Question>(question, Options);
        var deserialized = JsonSerializer.Deserialize<Question>(json, Options);

        Assert.NotNull(deserialized);
        Assert.Null(deserialized.Title);
        Assert.DoesNotContain("\"title\"", json);
    }

    [Fact]
    public void PresenterStateDto_WithRevealState_SerializesCorrectly()
    {
        var dto = new PresenterStateDto(
            Screen: "question-detail",
            CategoryId: "cat1",
            QuestionId: "q1",
            RevealState: new RevealState(
                MemeImageRevealed: true,
                TimerState: new QuestionTimerState("running", 60, 42, "2026-06-20T10:00:00Z")));

        var json = JsonSerializer.Serialize(dto, Options);
        var deserialized = JsonSerializer.Deserialize<PresenterStateDto>(json, Options);

        Assert.NotNull(deserialized);
        Assert.NotNull(deserialized.RevealState);
        Assert.True(deserialized.RevealState.MemeImageRevealed);
        Assert.NotNull(deserialized.RevealState.TimerState);
        Assert.Equal("running", deserialized.RevealState.TimerState!.Status);
        Assert.Equal(42, deserialized.RevealState.TimerState.RemainingSeconds);
    }

    [Fact]
    public void PresenterStateDto_WithNullRevealState_IsBackwardCompatible()
    {
        var dto = new PresenterStateDto(Screen: "idle");

        var json = JsonSerializer.Serialize(dto, Options);
        var deserialized = JsonSerializer.Deserialize<PresenterStateDto>(json, Options);

        Assert.NotNull(deserialized);
        Assert.Null(deserialized.RevealState);
    }
}
