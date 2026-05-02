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
    public void RevealState_SerializesAndDeserializesCorrectly()
    {
        var state = new RevealState(
            MemeImageRevealed: true,
            SingingPianosBoxesRevealed:
            [
                new RevealedBox("box1", true),
                new RevealedBox("box2", false),
                new RevealedBox("box3", true),
            ]);

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
    public void PresenterStateDto_WithRevealState_SerializesCorrectly()
    {
        var dto = new PresenterStateDto(
            Screen: "question-detail",
            CategoryId: "cat1",
            QuestionId: "q1",
            RevealState: new RevealState(MemeImageRevealed: true));

        var json = JsonSerializer.Serialize(dto, Options);
        var deserialized = JsonSerializer.Deserialize<PresenterStateDto>(json, Options);

        Assert.NotNull(deserialized);
        Assert.NotNull(deserialized.RevealState);
        Assert.True(deserialized.RevealState.MemeImageRevealed);
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
