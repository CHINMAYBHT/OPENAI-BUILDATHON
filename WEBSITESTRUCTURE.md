🔶 1. Company List Overview Page

Before showing questions, the user first sees a grid/list of companies.

➤ Each company card should include:

Company logo (placeholder)

Company name

Total questions available

Difficulty distribution:

Easy count

Medium count

Hard count

A short tagline (e.g., “Frequently asked in interviews”)

“View Questions” button

➤ Example companies:

Amazon

Google

Microsoft

Meta

Netflix

Adobe

Goldman Sachs

Bloomberg

Infosys

TCS

Accenture

Wipro

Zoho

Flipkart

🔶 2. Clicking a Company → Company Questions Page

The page opens:

/coding/pages/companyQuestions.html?company=Amazon


This page contains all questions asked in that specific company.

🔶 3. Header Section (for selected company)

Company logo

Company name

Difficulty breakdown:

● Easy: X

● Medium: Y

● Hard: Z

Tags: SWE / SDE / Intern / Backend / Frontend (optional)

🔶 4. Filters Section

Filters should match the All Problems page but scoped to one company:

Filtering Options:

Search bar

Difficulty filter:

Easy

Medium

Hard

Topic filter dropdown:

Arrays

Strings

Trees

DP

Graphs

HashMap

Recursion

Two Pointers

Binary Search

etc.

Solved / Unsolved / Attempted filter

Starred / Liked filter

🔶 5. Questions List UI

Each problem card should show:

Problem title

Difficulty (colored badge)

Topics

Company tag

Status icons:

✔ Solved

★ Starred

♥ Liked

“Open” button

Problem ID

Short description (optional)

On click:
/coding/pages/editor.html?id=<problemID>

🔶 6. Analytics Panel (Optional but powerful)

Show:

Total questions in this company

How many solved

Percentage solved

Weak areas by topic

Estimated difficulty trend for that company

This motivates the user.

🔶 7. Sorting Options

Sort by:

Difficulty

Most asked

Recently added

Acceptance rate

Topic

🔶 8. Recommended Order / Company Pattern

Some companies have a known order:

Amazon → Arrays, Strings, Trees

Google → Graphs, DP, Recursion

Meta → System design + coding

You can add:

“Recommended order of solving” section

“Must solve for this company” list

🔶 9. Ability to Save This Company List

User can save it as:

“My Company Prep”

Add to My Sheets

Mark as active preparation

Saved via localStorage or backend.

🔶 10. AI-generated Company Insights (Optional but cool)

Add an info panel:

Common topics asked

Difficulty trends

Typical interview format

Average acceptance rate

Resume hints for this company

Generated using OpenAI.