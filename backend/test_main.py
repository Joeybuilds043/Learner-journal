import unittest

from main import build_prompt


class PromptTests(unittest.TestCase):
    def test_prompt_includes_question_and_market_context(self):
        prompt = build_prompt(
            "Why did Bitcoin move?",
            {"assets": [{"symbol": "BTCUSDT", "price": 65000}], "macro": {"provider": "FRED"}},
        )
        self.assertIn("Why did Bitcoin move?", prompt)
        self.assertIn("BTCUSDT", prompt)
        self.assertIn("FRED", prompt)

    def test_prompt_includes_follow_up_context(self):
        prompt = build_prompt(
            "What does that imply for gold?",
            {"assets": []},
            [
                {"role": "user", "content": "Explain rising Treasury yields."},
                {"role": "assistant", "content": "Higher yields can pressure duration assets."},
            ],
        )
        self.assertIn("Explain rising Treasury yields.", prompt)
        self.assertIn("Higher yields can pressure duration assets.", prompt)
        self.assertIn("What does that imply for gold?", prompt)

    def test_daily_brief_mentions_data_limitations(self):
        prompt = build_prompt("Generate the daily brief.", {"assets": []}, daily=True)
        self.assertIn("MARKET SNAPSHOT", prompt)
        self.assertIn("DATA LIMITATIONS", prompt)
        self.assertIn("Do not invent a calendar", prompt)


if __name__ == "__main__":
    unittest.main()
