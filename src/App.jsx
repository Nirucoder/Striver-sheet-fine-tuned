import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ─── LEETCODE LINKS PER STEP ──────────────────────────────────────────────────
const STEP_LEETCODE = {
1: [
{ title: "Two Sum", url: "https://leetcode.com/problems/two-sum/" },
{ title: "Reverse String", url: "https://leetcode.com/problems/reverse-string/" },
{ title: "Palindrome Number", url: "https://leetcode.com/problems/palindrome-number/" },
{ title: "Fibonacci Number", url: "https://leetcode.com/problems/fibonacci-number/" },
{ title: "GCD of Two Numbers (Math)", url: "https://leetcode.com/problems/find-greatest-common-divisor-of-array/" },
{ title: "Count Primes", url: "https://leetcode.com/problems/count-primes/" },
],
2: [
{ title: "Sort Colors (Dutch Flag)", url: "https://leetcode.com/problems/sort-colors/" },
{ title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/" },
{ title: "Insertion Sort List", url: "https://leetcode.com/problems/insertion-sort-list/" },
{ title: "Sort an Array (Merge Sort)", url: "https://leetcode.com/problems/sort-an-array/" },
],
3: [
{ title: "Missing Number", url: "https://leetcode.com/problems/missing-number/" },
{ title: "Maximum Subarray (Kadane's)", url: "https://leetcode.com/problems/maximum-subarray/" },
{ title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
{ title: "3Sum", url: "https://leetcode.com/problems/3sum/" },
{ title: "4Sum", url: "https://leetcode.com/problems/4sum/" },
{ title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/" },
{ title: "Set Matrix Zeroes", url: "https://leetcode.com/problems/set-matrix-zeroes/" },
{ title: "Rotate Image", url: "https://leetcode.com/problems/rotate-image/" },
{ title: "Spiral Matrix", url: "https://leetcode.com/problems/spiral-matrix/" },
{ title: "Pascal's Triangle", url: "https://leetcode.com/problems/pascals-triangle/" },
{ title: "Maximum Product Subarray", url: "https://leetcode.com/problems/maximum-product-subarray/" },
{ title: "Reverse Pairs", url: "https://leetcode.com/problems/reverse-pairs/" },
],
4: [
{ title: "Binary Search", url: "https://leetcode.com/problems/binary-search/" },
{ title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
{ title: "Find Minimum in Rotated Sorted Array", url:
"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
{ title: "Single Element in Sorted Array", url: "https://leetcode.com/problems/single-element-in-a-sorted-array/" },
{ title: "Find Peak Element", url: "https://leetcode.com/problems/find-peak-element/" },
{ title: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/" },
{ title: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
{ title: "Search a 2D Matrix", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
],
5: [
{ title: "Longest Substring Without Repeating Characters", url:
"https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
{ title: "Longest Palindromic Substring", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
{ title: "Roman to Integer", url: "https://leetcode.com/problems/roman-to-integer/" },
{ title: "Integer to Roman", url: "https://leetcode.com/problems/integer-to-roman/" },
{ title: "String to Integer (atoi)", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
{ title: "Implement strStr() / KMP", url:
"https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/" },
{ title: "Shortest Palindrome", url: "https://leetcode.com/problems/shortest-palindrome/" },
],
6: [
{ title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/" },
{ title: "Middle of the Linked List", url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
{ title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/" },
{ title: "Linked List Cycle II", url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
{ title: "Remove Nth Node From End", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
{ title: "Add Two Numbers", url: "https://leetcode.com/problems/add-two-numbers/" },
{ title: "Odd Even Linked List", url: "https://leetcode.com/problems/odd-even-linked-list/" },
{ title: "Reverse Nodes in k-Group", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
{ title: "Copy List with Random Pointer", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },
{ title: "Sort List", url: "https://leetcode.com/problems/sort-list/" },
{ title: "Flatten a Multilevel Doubly Linked List", url:
"https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/" },
],
7: [
{ title: "Subsets", url: "https://leetcode.com/problems/subsets/" },
{ title: "Subsets II", url: "https://leetcode.com/problems/subsets-ii/" },
{ title: "Combination Sum", url: "https://leetcode.com/problems/combination-sum/" },
{ title: "Combination Sum II", url: "https://leetcode.com/problems/combination-sum-ii/" },
{ title: "Permutations", url: "https://leetcode.com/problems/permutations/" },
{ title: "Palindrome Partitioning", url: "https://leetcode.com/problems/palindrome-partitioning/" },
{ title: "N-Queens", url: "https://leetcode.com/problems/n-queens/" },
{ title: "Sudoku Solver", url: "https://leetcode.com/problems/sudoku-solver/" },
{ title: "Word Search", url: "https://leetcode.com/problems/word-search/" },
{ title: "Rat in a Maze (similar: Unique Paths III)", url: "https://leetcode.com/problems/unique-paths-iii/" },
],
8: [
{ title: "Single Number", url: "https://leetcode.com/problems/single-number/" },
{ title: "Single Number II", url: "https://leetcode.com/problems/single-number-ii/" },
{ title: "Single Number III", url: "https://leetcode.com/problems/single-number-iii/" },
{ title: "Number of 1 Bits", url: "https://leetcode.com/problems/number-of-1-bits/" },
{ title: "Reverse Bits", url: "https://leetcode.com/problems/reverse-bits/" },
{ title: "Power of Two", url: "https://leetcode.com/problems/power-of-two/" },
{ title: "Counting Bits", url: "https://leetcode.com/problems/counting-bits/" },
{ title: "Divide Two Integers", url: "https://leetcode.com/problems/divide-two-integers/" },
{ title: "Subsets (Bitmask)", url: "https://leetcode.com/problems/subsets/" },
],
9: [
{ title: "Min Stack", url: "https://leetcode.com/problems/min-stack/" },
{ title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/" },
{ title: "Implement Queue using Stacks", url: "https://leetcode.com/problems/implement-queue-using-stacks/" },
{ title: "Next Greater Element I", url: "https://leetcode.com/problems/next-greater-element-i/" },
{ title: "Next Greater Element II", url: "https://leetcode.com/problems/next-greater-element-ii/" },
{ title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/" },
{ title: "Sum of Subarray Minimums", url: "https://leetcode.com/problems/sum-of-subarray-minimums/" },
{ title: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
{ title: "Maximal Rectangle", url: "https://leetcode.com/problems/maximal-rectangle/" },
{ title: "Remove K Digits", url: "https://leetcode.com/problems/remove-k-digits/" },
{ title: "Asteroid Collision", url: "https://leetcode.com/problems/asteroid-collision/" },
],
10: [
{ title: "Longest Substring Without Repeating Characters", url:
"https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
{ title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/" },
{ title: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/" },
{ title: "Longest Repeating Character Replacement", url:
"https://leetcode.com/problems/longest-repeating-character-replacement/" },
{ title: "Binary Subarrays With Sum", url: "https://leetcode.com/problems/binary-subarrays-with-sum/" },
{ title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/" },
{ title: "Subarrays with K Different Integers", url:
"https://leetcode.com/problems/subarrays-with-k-different-integers/" },
{ title: "Max Points You Can Obtain from Cards", url:
"https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/" },
],
11: [
{ title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
{ title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream/" },
{ title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
{ title: "Top K Frequent Words", url: "https://leetcode.com/problems/top-k-frequent-words/" },
{ title: "Kth Largest Element in a Stream", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
{ title: "Smallest Range Covering Elements from K Lists", url:
"https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/" },
{ title: "Merge K Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
],
12: [
{ title: "Assign Cookies", url: "https://leetcode.com/problems/assign-cookies/" },
{ title: "Lemonade Change", url: "https://leetcode.com/problems/lemonade-change/" },
{ title: "Jump Game", url: "https://leetcode.com/problems/jump-game/" },
{ title: "Jump Game II", url: "https://leetcode.com/problems/jump-game-ii/" },
{ title: "Candy", url: "https://leetcode.com/problems/candy/" },
{ title: "Non-overlapping Intervals", url: "https://leetcode.com/problems/non-overlapping-intervals/" },
{ title: "Insert Interval", url: "https://leetcode.com/problems/insert-interval/" },
{ title: "Fractional Knapsack (similar: Maximum Units on a Truck)", url:
"https://leetcode.com/problems/maximum-units-on-a-truck/" },
{ title: "Valid Parenthesis String", url: "https://leetcode.com/problems/valid-parenthesis-string/" },
],
13: [
{ title: "Binary Tree Inorder Traversal", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" },
{ title: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
{ title: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
{ title: "Balanced Binary Tree", url: "https://leetcode.com/problems/balanced-binary-tree/" },
{ title: "Diameter of Binary Tree", url: "https://leetcode.com/problems/diameter-of-binary-tree/" },
{ title: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
{ title: "Symmetric Tree", url: "https://leetcode.com/problems/symmetric-tree/" },
{ title: "Binary Tree Zigzag Level Order", url:
"https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
{ title: "Binary Tree Right Side View", url: "https://leetcode.com/problems/binary-tree-right-side-view/" },
{ title: "Vertical Order Traversal", url: "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/" },
{ title: "Lowest Common Ancestor of BT", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"
},
{ title: "Nodes at Distance K", url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/" },
{ title: "Serialize and Deserialize Binary Tree", url:
"https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
{ title: "Flatten Binary Tree to Linked List", url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/"
},
{ title: "Construct BT from Preorder and Inorder", url:
"https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
],
14: [
{ title: "Search in a BST", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
{ title: "Insert into a BST", url: "https://leetcode.com/problems/insert-into-a-binary-search-tree/" },
{ title: "Delete Node in a BST", url: "https://leetcode.com/problems/delete-node-in-a-bst/" },
{ title: "Kth Smallest in BST", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
{ title: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
{ title: "LCA of BST", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
{ title: "Construct BST from Preorder", url:
"https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/" },
{ title: "Two Sum IV – BST", url: "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/" },
{ title: "Recover Binary Search Tree", url: "https://leetcode.com/problems/recover-binary-search-tree/" },
],
15: [
{ title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/" },
{ title: "Flood Fill", url: "https://leetcode.com/problems/flood-fill/" },
{ title: "Course Schedule (Cycle Detection)", url: "https://leetcode.com/problems/course-schedule/" },
{ title: "Course Schedule II (Topo Sort)", url: "https://leetcode.com/problems/course-schedule-ii/" },
{ title: "Word Ladder", url: "https://leetcode.com/problems/word-ladder/" },
{ title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" },
{ title: "Network Delay Time (Dijkstra)", url: "https://leetcode.com/problems/network-delay-time/" },
{ title: "Path with Minimum Effort", url: "https://leetcode.com/problems/path-with-minimum-effort/" },
{ title: "Min Cost to Connect All Points (Prim/Kruskal)", url:
"https://leetcode.com/problems/min-cost-to-connect-all-points/" },
{ title: "Accounts Merge (DSU)", url: "https://leetcode.com/problems/accounts-merge/" },
{ title: "Swim in Rising Water", url: "https://leetcode.com/problems/swim-in-rising-water/" },
{ title: "Critical Connections (Bridges)", url: "https://leetcode.com/problems/critical-connections-in-a-network/" },
{ title: "Is Graph Bipartite?", url: "https://leetcode.com/problems/is-graph-bipartite/" },
],
16: [
{ title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/" },
{ title: "House Robber", url: "https://leetcode.com/problems/house-robber/" },
{ title: "House Robber II", url: "https://leetcode.com/problems/house-robber-ii/" },
{ title: "Unique Paths", url: "https://leetcode.com/problems/unique-paths/" },
{ title: "Minimum Path Sum", url: "https://leetcode.com/problems/minimum-path-sum/" },
{ title: "Triangle", url: "https://leetcode.com/problems/triangle/" },
{ title: "Partition Equal Subset Sum", url: "https://leetcode.com/problems/partition-equal-subset-sum/" },
{ title: "0/1 Knapsack (Subset Sum variant)", url: "https://leetcode.com/problems/last-stone-weight-ii/" },
{ title: "Coin Change", url: "https://leetcode.com/problems/coin-change/" },
{ title: "Coin Change II", url: "https://leetcode.com/problems/coin-change-ii/" },
{ title: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/" },
{ title: "Longest Palindromic Subsequence", url: "https://leetcode.com/problems/longest-palindromic-subsequence/" },
{ title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/" },
{ title: "Wildcard Matching", url: "https://leetcode.com/problems/wildcard-matching/" },
{ title: "Distinct Subsequences", url: "https://leetcode.com/problems/distinct-subsequences/" },
{ title: "Best Time to Buy & Sell Stock III", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/"
},
{ title: "Best Time to Buy & Sell Stock IV", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/" },
{ title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
{ title: "Number of LIS", url: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/" },
{ title: "Burst Balloons (MCM)", url: "https://leetcode.com/problems/burst-balloons/" },
{ title: "Palindrome Partitioning II", url: "https://leetcode.com/problems/palindrome-partitioning-ii/" },
],
17: [
{ title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
{ title: "Word Search II (Trie + Backtracking)", url: "https://leetcode.com/problems/word-search-ii/" },
{ title: "Design Add and Search Words", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/"
},
{ title: "Maximum XOR of Two Numbers in Array", url:
"https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
{ title: "Longest Word in Dictionary", url: "https://leetcode.com/problems/longest-word-in-dictionary/" },
],
};

// ─── STRIVER A2Z SHEET DATA ────────────────────────────────────────────────────
const STRIVER_STEPS = [
{ step:1, title:"Learn the Basics", week:1, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", subtopics:[
{ name:"C++ Basics – I/O, Data Types, If-Else, Switch, Arrays, Strings", problems:6 },
{ name:"C++ Basics – Pass by Value/Ref, Functions, Time Complexity", problems:3 },
{ name:"Logical Thinking – Patterns (22 pattern problems)", problems:22 },
{ name:"STL – Pairs, Vectors, Maps, Sets, Priority Queue, Algorithms", problems:7 },
{ name:"Basic Maths – Count Digits, Reverse Number, Palindrome, GCD, Armstrong, Count Primes", problems:7 },
{ name:"Basic Recursion – Print 1-N, Factorial, Reverse Array, Fibonacci, Palindrome", problems:8 },
{ name:"Basic Hashing – Count Frequency, High/Low Frequency, Count elements in range", problems:4 },
]},
{ step:2, title:"Sorting Techniques", week:1, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", subtopics:[
{ name:"Selection Sort", problems:1 },
{ name:"Bubble Sort", problems:1 },
{ name:"Insertion Sort", problems:1 },
{ name:"Merge Sort", problems:1 },
{ name:"Recursive Bubble Sort", problems:1 },
{ name:"Recursive Insertion Sort", problems:1 },
{ name:"Quick Sort", problems:1 },
]},
{ step:3, title:"Arrays", week:2, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB", subtopics:[
{ name:"Easy – Largest, 2nd Largest, Check Sorted, Remove Dups, Left Rotate by 1/K", problems:6 },
{ name:"Easy – Move Zeros, Linear Search, Find Union, Missing Number, Max Consecutive 1s", problems:5 },
{ name:"Easy – Single Number, Longest Subarray with Sum K (positives)", problems:2 },
{ name:"Medium – 2Sum, Sort 0s/1s/2s, Majority Element, Kadane's Algorithm", problems:4 },
{ name:"Medium – Print Subarray with Max Sum, Stock Buy & Sell, Rearrange by Sign", problems:3 },
{ name:"Medium – Next Permutation, Leaders in Array, Longest Consecutive, Set Matrix Zeros", problems:4 },
{ name:"Medium – Rotate Matrix 90°, Spiral Matrix, Count subarrays with given sum", problems:3 },
{ name:"Hard – Pascal's Triangle, Majority Element II, 3Sum, 4Sum", problems:4 },
{ name:"Hard – Largest Subarray with 0 sum, Count subarrays XOR=K, Merge Overlapping Intervals", problems:3 },
{ name:"Hard – Merge Sorted Arrays, Find Repeated & Missing, Count Inversions, Reverse Pairs, Max Product Subarray",
problems:5 },
]},
{ step:4, title:"Binary Search", week:2, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0pMFvwuHEsD6BRWHflpzN3V", subtopics:[
{ name:"1D – Binary Search, Lower Bound, Upper Bound, Search Insert Position, Floor & Ceil", problems:5 },
{ name:"1D – First & Last Occurrence, Count, Search in Rotated, Min in Rotated, Single Element, Peak Element",
problems:7 },
{ name:"BS on Answers – Square Root, Nth Root, Koko Bananas, Min Days for M Bouquets", problems:4 },
{ name:"BS on Answers – Smallest Divisor, Ship Packages, Kth Missing Positive, Aggressive Cows", problems:4 },
{ name:"BS on Answers – Book Allocation, Split Array, Painter's Partition, Minimize Max Distance", problems:4 },
{ name:"BS on Answers – Median of 2 Sorted Arrays, Kth element of 2 Sorted Arrays", problems:2 },
{ name:"2D – Row with max 1s, Search in 2D Matrix I & II, Peak in 2D, Matrix Median", problems:5 },
]},
{ step:5, title:"Strings", week:3, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB", subtopics:[
{ name:"Basic – Reverse Words, Longest Palindrome, Roman to Integer", problems:3 },
{ name:"Basic – Implement Atoi, Count Substrings with K Distinct Chars, Longest Palindromic Substring", problems:3 },
{ name:"Medium – Sort Characters by Frequency, Integer to Roman, String to Integer", problems:3 },
{ name:"Medium – Count Substrings, Longest Happy Prefix, Sum of Beauty of all Substrings", problems:3 },
{ name:"Advanced – String Matching (Z-algo, KMP), Rabin Karp, Shortest Palindrome, Largest Copy Substring", problems:9
},
]},
{ step:6, title:"Linked List", week:3, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0rAuz8AsMEhQvk3oP21EHFv", subtopics:[
{ name:"Single LL – Intro, Insertion (head/tail/kth pos), Deletion, Search, Length", problems:6 },
{ name:"Single LL Medium – Middle, Reverse, Detect Loop, Find length of Loop, Remove Loop", problems:5 },
{ name:"Single LL Medium – Starting Point of Loop, Remove Nth from End, Delete given Node, Add 2 Numbers", problems:4 },
{ name:"Single LL Medium – Odd-Even LL, Sort LL, Sort LL of 0s 1s 2s", problems:3 },
{ name:"Single LL Hard – Reverse in groups of K, Rotate LL, Flatten LL, Copy LL with Random Pointer", problems:4 },
{ name:"Double LL – Intro, Insert/Delete, Reverse, Merge Sort on DLL", problems:7 },
]},
{ step:7, title:"Recursion & Backtracking", week:4, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9", subtopics:[
{ name:"Get Strong in Recursion – Fibonacci, Print 1-N/N-1, Sum, Factorial, Reverse Array, Palindrome", problems:9 },
{ name:"Subsequences – Print All, Subset Sums I & II, Combination Sum I & II & III", problems:6 },
{ name:"Backtracking – Phone Keypad, Palindrome Partitioning, Word Search, N-Queens, Sudoku Solver", problems:5 },
{ name:"Backtracking – M Coloring, Rat in a Maze, Word Break, Expression Add Operators", problems:5 },
]},
{ step:8, title:"Bit Manipulation", week:4, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0rnqhCGjlEaGz6-z6aU727L", subtopics:[
{ name:"Concepts – Intro, Check ith bit, Set/Clear/Toggle bit, Check Power of 2", problems:5 },
{ name:"Concepts – Count Set Bits, Set rightmost unset bit, Swap using XOR", problems:3 },
{ name:"Problems – Count Bits 0 to N, Reverse Bits, Single Number I/II/III", problems:4 },
{ name:"Problems – XOR in Range, Divide 2 Integers, Subsets using Bit Masking", problems:4 },
]},
{ step:9, title:"Stack & Queues", week:5, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0oSO572kQ7KCSvCUh1AdILj", subtopics:[
{ name:"Learning – Stack/Queue using Arrays & LL, Stack using Queue, Queue using Stack, Min Stack", problems:7 },
{ name:"Prefix/Infix/Postfix – Intro, Evaluation, Infix↔Postfix, Infix↔Prefix conversion", problems:5 },
{ name:"Monotonic Stack – Next Greater Element I & II, Previous Smaller Element, NGE to right", problems:4 },
{ name:"Monotonic Stack – Trapping Rain Water, Sum of Subarray Minimums, Asteroid Collision", problems:3 },
{ name:"Monotonic Stack – Subarray Ranges, Remove K Digits, Largest Rectangle in Histogram, Maximal Rectangle",
problems:4 },
]},
{ step:10, title:"Sliding Window & Two Pointers", week:5, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0q7vrFA_HEWcqRqMpCXzYAL", subtopics:[
{ name:"Medium – Longest Subarray Sum K (pos), Longest Substring without Repeat, Max Consecutive 1s III", problems:3 },
{ name:"Medium – Fruit into Baskets, Longest Repeating Char Replacement, Binary Subarray with Sum", problems:3 },
{ name:"Medium – Count Nice Subarrays, Substrings with all 3 chars, Max Points from Cards", problems:3 },
{ name:"Hard – Longest Substring at most K Distinct, Minimum Window Substring, Subarray with K Different Integers",
problems:3 },
]},
{ step:11, title:"Heaps", week:5, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", subtopics:[
{ name:"Learning – Intro to Heap, Heapify, Insert, Delete, Heap Sort, Priority Queue STL", problems:5 },
{ name:"Medium – Kth Largest/Smallest Element, Max Sum Combinations", problems:3 },
{ name:"Medium – Find Median from Data Stream, K Most Frequent Elements, Top K Frequent Words", problems:3 },
{ name:"Hard – Kth Largest in Stream, Distinct Numbers in Window, Smallest Range, Merge K Sorted Lists", problems:6 },
]},
{ step:12, title:"Greedy Algorithms", week:6, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", subtopics:[
{ name:"Easy – Assign Cookies, Fractional Knapsack, Min Coins, Lemonade Change, Valid Parenthesis String", problems:5 },
{ name:"Medium/Hard – N Meetings in Room, Jump Game I & II, Job Sequencing, Candy", problems:5 },
{ name:"Medium/Hard – Shortest Job First, Insert Intervals, Merge Intervals, Non Overlapping Intervals", problems:5 },
]},
{ step:13, title:"Binary Trees", week:6, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk", subtopics:[
{ name:"Traversals – Inorder, Preorder, Postorder (Recursive + Iterative), Level Order, All 3 in one", problems:8 },
{ name:"Medium – Height, Balanced Tree, Diameter, Max Path Sum, Identical Trees, Zigzag Traversal", problems:6 },
{ name:"Medium – Boundary Traversal, Vertical Order, Top View, Bottom View, Right/Left View, Symmetric", problems:6 },
{ name:"Hard – Root to Node Path, LCA, Max Width, Children Sum Property, Nodes at Distance K", problems:5 },
{ name:"Hard – Burn Tree, Count Complete BT Nodes, Construct from Pre+In, Construct from Post+In", problems:5 },
{ name:"Hard – Serialize & Deserialize, Morris Traversal Inorder/Preorder, Flatten BT to LL", problems:5 },
]},
{ step:14, title:"Binary Search Tree", week:6, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk", subtopics:[
{ name:"Concepts – Search in BST, Find Min/Max, Ceil, Floor in BST", problems:4 },
{ name:"Problems – Insert, Delete, Kth Smallest, Kth Largest, Validate BST", problems:5 },
{ name:"Problems – LCA in BST, Construct from Preorder, Inorder Successor/Predecessor, BST Iterator", problems:4 },
{ name:"Problems – Two Sum in BST, Recover BST, Largest BST in Binary Tree", problems:4 },
]},
{ step:15, title:"Graphs", week:7, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn", subtopics:[
{ name:"Learning – Intro, BFS, DFS, Cycle in Undirected (BFS/DFS), Bipartite (BFS/DFS)", problems:6 },
{ name:"Learning – Cycle in Directed (DFS), Topo Sort DFS, Topo Sort BFS (Kahn's)", problems:3 },
{ name:"Problems – Shortest Path in DAG, Shortest Path Undirected, Word Ladder I & II", problems:4 },
{ name:"Shortest Path – Dijkstra (PQ & Set), Binary Maze, Min Effort Path, Cheapest Flights", problems:4 },
{ name:"Shortest Path – Network Delay, Ways to Arrive, Min Multiplications, Bellman Ford, Floyd Warshall, Find City",
problems:6 },
{ name:"MST – Prim's, Kruskal's, Disjoint Set (Union by Rank/Size + Path Compression)", problems:5 },
{ name:"Advanced – Bridges, Articulation Points, Kosaraju's SCC, Tarjan's SCC", problems:4 },
{ name:"Problems on DS – Number of Islands I & II, Making Large Islands, Swim in Rising Water, Account Merge",
problems:6 },
]},
{ step:16, title:"Dynamic Programming", week:7, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY", subtopics:[
{ name:"1D DP – Climbing Stairs, Frog Jump, Frog Jump K distances, Max Sum Non Adjacent, House Robber II", problems:5 },
{ name:"2D/Grid DP – Unique Paths I & II, Min Path Sum, Triangle, Min Falling Path Sum, Cherry Pickup II", problems:6 },
{ name:"DP on Subsequences – Subset Sum, Partition Equal Subset, Partition Min Diff, Count subsets with sum K",
problems:4 },
{ name:"DP on Subsequences – Count partitions D, 0-1 Knapsack, Min Coins, Target Sum, Coin Change II, Unbounded Knapsack, Rod Cutting", problems:7 },
{ name:"DP on Strings – LCS, Print LCS, Longest Common Substring, Longest Palindromic Subsequence", problems:4 },
{ name:"DP on Strings – Min insertions palindrome, Edit Distance, Wildcard, Distinct Subsequences, SCS", problems:6 },
{ name:"DP on Stocks – Buy Sell I/II/III/IV, with Cooldown, with Fee", problems:6 },
{ name:"DP on LIS – LIS, Print LIS, Largest Divisible Subset, Longest Bitonic Subseq, Number of LIS, Min Deletions",
problems:6 },
{ name:"MCM / Partition DP – MCM, Min Cost Cut Stick, Burst Balloons, Evaluate Bool Expression, Palindrome Partition II, Partition Array for Max Sum", problems:6 },
]},
{ step:17, title:"Tries", week:8, youtubeUrl:"https://www.youtube.com/playlist?list=PLgUwDviBIf0pcIDCZnxhv0Gd8PTK7XQv9", subtopics:[
{ name:"Implement Trie I & II, Longest String with All Prefixes", problems:3 },
{ name:"Number of Distinct Substrings, Max XOR of 2 Numbers, Max XOR with Queries", problems:3 },
]},
];

const COA_TABLE = [
{ id:"coa_1_1", topic:"Number Systems", subtopics:"Binary, Decimal, Octal, Hexadecimal conversions", week:1,
practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_1_2", topic:"Binary Arithmetic", subtopics:"Addition, Subtraction, Multiplication, Division in binary",
week:1, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_1_3", topic:"Complements", subtopics:"1's Complement, 2's Complement, Representation of negative numbers",
week:1, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_2_1", topic:"Boolean Algebra", subtopics:"Boolean Laws, De Morgan's Theorem, Duality Principle", week:2,
practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_2_2", topic:"Logic Gates", subtopics:"AND, OR, NOT, NAND, NOR, XOR, XNOR gates, Truth tables", week:2,
practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_2_3", topic:"Boolean Expressions", subtopics:"SOP, POS, Minterm, Maxterm, Simplification", week:2,
practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_2_4", topic:"K-Map Simplification", subtopics:"2/3/4 variable K-maps, grouping, don't care conditions",
week:2, practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_3_1", topic:"Combinational Circuits", subtopics:"Half Adder, Full Adder, Ripple Carry Adder, Carry Lookahead",
week:3, practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_3_2", topic:"ALU Basics", subtopics:"Arithmetic & Logic operations, ALU design, 4-bit ALU", week:3,
practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_3_3", topic:"Multiplexers & Decoders", subtopics:"MUX, DEMUX, Encoders, Decoders, Priority Encoder", week:3,
practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_4_1", topic:"Computer Organization Overview", subtopics:"Functional Units, CPU, ALU, Control Unit, Registers, Bus Structure", week:4, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_4_2", topic:"Von Neumann Architecture", subtopics:"Von Neumann model, Harvard architecture, Stored program concept", week:4, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_4_3", topic:"Instruction Cycle", subtopics:"Fetch, Decode, Execute cycle, Timing diagrams, Micro-operations",
week:4, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_4_4", topic:"Memory Organization", subtopics:"MAR, MDR, Memory hierarchy, Address space, Word length", week:4,
practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_5_1", topic:"CPU Registers & Datapath", subtopics:"PC, IR, ACC, SP, General purpose registers, Register transfer language", week:5, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_5_2", topic:"Instruction Formats & Addressing Modes", subtopics:"0/1/2/3 address instructions, Direct, Indirect, Immediate, Register, Relative addressing", week:5, practiceTarget:4, confidence:0, revisionRequired:false,
status:"pending" },
{ id:"coa_5_3", topic:"Control Unit Design", subtopics:"Hardwired vs Microprogrammed CU, Microinstruction, Control signals", week:5, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_6_1", topic:"Pipelining", subtopics:"Pipeline stages (IF/ID/EX/MEM/WB), Performance metrics, Speedup, Throughput, Efficiency", week:6, practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_6_2", topic:"Pipeline Hazards", subtopics:"Data hazards (RAW/WAR/WAW), Control hazards, Structural hazards, Stalling, Forwarding", week:6, practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_6_3", topic:"Memory Systems", subtopics:"Cache memory, Mapping techniques (Direct/Associative/Set Associative), Write policies, TLB", week:6, practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_7_1", topic:"Parallelism & Flynn's Classification", subtopics:"SISD, SIMD, MISD, MIMD, Hardware vs Software parallelism", week:7, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_7_2", topic:"Multi-core & Multiprocessor Systems", subtopics:"Shared memory, Distributed memory, Cache coherence, NUMA", week:7, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_7_3", topic:"I/O Organization", subtopics:"I/O interfaces, Polling, Interrupts, DMA, I/O channels", week:7,
practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_8_1", topic:"Revision – Number Systems & Boolean Algebra", subtopics:"Full revision + practice problems",
week:8, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_8_2", topic:"Revision – Combinational & Sequential Circuits", subtopics:"Adders, MUX, Flip-flops, Registers, Counters", week:8, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_8_3", topic:"Revision – Architecture & Pipelining", subtopics:"Von Neumann, Instruction cycle, Pipelining, Hazards, Cache", week:8, practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
{ id:"coa_8_4", topic:"Revision – Previous Year Questions", subtopics:"GATE PYQs, University exam pattern questions",
week:8, practiceTarget:5, confidence:0, revisionRequired:false, status:"pending" },
];

const WEEK_PLAN = [
{ week:1, title:"Basics + Sorting", dsaSteps:[1,2], coaWeek:1 },
{ week:2, title:"Arrays + Binary Search", dsaSteps:[3,4], coaWeek:2 },
{ week:3, title:"Strings + Linked List", dsaSteps:[5,6], coaWeek:3 },
{ week:4, title:"Recursion + Bit Manip.", dsaSteps:[7,8], coaWeek:4 },
{ week:5, title:"Stack/Queue + Heaps + SW", dsaSteps:[9,10,11], coaWeek:5 },
{ week:6, title:"Greedy + Trees + BST", dsaSteps:[12,13,14],coaWeek:6 },
{ week:7, title:"Graphs + DP", dsaSteps:[15,16], coaWeek:7 },
{ week:8, title:"Tries + Revision + Mock", dsaSteps:[17], coaWeek:8 },
];

const DSA_TABLE = STRIVER_STEPS.flatMap(step =>
step.subtopics.map((sub, si) => ({
id: `s${step.step}_${si}`,
step: step.step,
stepTitle: step.title,
topic: sub.name,
problems: sub.problems,
solved: 0,
confidence: 0,
revisionRequired: false,
status: "pending",
week: step.week,
}))
);

const ALL_REV_TOPICS = [
...STRIVER_STEPS.map(s => ({ id:`rev_dsa_s${s.step}`, topic:`Step ${s.step}: ${s.title}`, type:"DSA", week:s.week,
day:false, week1:false, month:false })),
...COA_TABLE.map(c => ({ id:`rev_${c.id}`, topic:c.topic, type:"COA", week:c.week, day:false, week1:false, month:false
})),
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function useLocalStorage(key, init) {
const [val, setVal] = useState(() => {
try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (typeof init==="function" ? init() : init); }
catch { return typeof init==="function" ? init() : init; }
});
useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
return [val, setVal];
}

const WEEK_COLORS = ["#818cf8","#34d399","#f472b6","#fb923c","#60a5fa","#a78bfa","#facc15","#4ade80"];
const STEP_COLORS =
{1:"#818cf8",2:"#a78bfa",3:"#34d399",4:"#4ade80",5:"#f472b6",6:"#fb7185",7:"#fb923c",8:"#fbbf24",9:"#60a5fa",10:"#38bdf8",11:"#22d3ee",12:"#34d399",13:"#86efac",14:"#6ee7b7",15:"#f472b6",16:"#e879f9",17:"#c084fc"};

const S = {
app: { display:"flex", height:"100vh", background:"#0a0b0d", color:"#e2e8f0", fontFamily:"'DM Sans','Inter',sans-serif",
overflow:"hidden" },
sidebar: { width:220, background:"#0f1117", borderRight:"1px solid #1e2030", display:"flex", flexDirection:"column",
flexShrink:0 },
sidebarTop: { padding:"20px 16px 12px", borderBottom:"1px solid #1e2030" },
logo: { fontSize:14, fontWeight:700, color:"#e2e8f0", letterSpacing:"0.05em", textTransform:"uppercase" },
logoSub: { fontSize:11, color:"#4a5568", marginTop:2 },
nav: { padding:"8px 8px", flex:1, overflowY:"auto" },
navItem: (active) => ({ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8,
cursor:"pointer", marginBottom:2, background: active?"#1a1d2e":"transparent", color: active?"#818cf8":"#64748b",
fontSize:13, fontWeight: active?600:400, transition:"all 0.15s", border: active?"1px solid #2d3154":"1px solid transparent" }),
main: { flex:1, overflowY:"auto", padding:"24px 28px", background:"#0a0b0d" },
pageTitle: { fontSize:22, fontWeight:700, color:"#f1f5f9", marginBottom:4 },
pageSub: { fontSize:13, color:"#475569", marginBottom:24 },
grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 },
grid3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:20 },
grid4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 },
statCard: { background:"#0f1117", border:"1px solid #1e2030", borderRadius:12, padding:"16px 18px" },
statLabel: { fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 },
statValue: { fontSize:28, fontWeight:700, color:"#f1f5f9", lineHeight:1 },
statSub: { fontSize:12, color:"#64748b", marginTop:6 },
card: { background:"#0f1117", border:"1px solid #1e2030", borderRadius:12, padding:"18px 20px", marginBottom:16 },
sectionTitle: { fontSize:13, fontWeight:600, color:"#94a3b8", marginBottom:14, textTransform:"uppercase",
letterSpacing:"0.06em" },
badge: (color) => ({ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:20, fontSize:11,
fontWeight:600, background: color==="green"?"#0d2a1a":color==="blue"?"#0d1a2a":color==="amber"?"#2a1a0d":"#1a1a2a",
color: color==="green"?"#34d399":color==="blue"?"#60a5fa":color==="amber"?"#fbbf24":"#a78bfa" }),
table: { width:"100%", borderCollapse:"collapse", fontSize:12 },
th: { padding:"10px 12px", textAlign:"left", color:"#475569", fontWeight:600, fontSize:10, textTransform:"uppercase",
letterSpacing:"0.06em", borderBottom:"1px solid #1e2030" },
td: { padding:"9px 12px", borderBottom:"1px solid #0f1117", color:"#94a3b8", verticalAlign:"middle" },
input: { background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:6, color:"#e2e8f0", padding:"3px 7px",
fontSize:12, width:55, outline:"none" },
select: { background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:6, color:"#e2e8f0", padding:"4px 8px",
fontSize:12, outline:"none", cursor:"pointer" },
btn: (variant="default") => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8,
fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.15s", background:
variant==="primary"?"#4f46e5":variant==="success"?"#14532d":"#1e2030", color:
variant==="primary"?"#fff":variant==="success"?"#86efac":"#94a3b8" }),
filterBar: { display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" },
searchInput: { background:"#0f1117", border:"1px solid #1e2030", borderRadius:8, color:"#e2e8f0", padding:"8px 14px",
fontSize:13, outline:"none", flex:1, minWidth:200 },
check: { width:15, height:15, cursor:"pointer", accentColor:"#818cf8" },
streakBox: { background:"linear-gradient(135deg,#1a1d2e,#13162a)", border:"1px solid #2d3154", borderRadius:12,
padding:"16px 18px", display:"flex", alignItems:"center", gap:12, marginBottom:20 },
confetti: { position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 },
lcLink: { display:"inline-flex", alignItems:"center", gap:4, color:"#f97316", fontSize:11, fontWeight:600,
textDecoration:"none", background:"#1c1108", border:"1px solid #431407", borderRadius:5, padding:"2px 7px",
marginRight:4, marginBottom:3, transition:"background 0.15s", whiteSpace:"nowrap" },
lcPanel: { background:"#0d0e12", border:"1px solid #1e2030", borderRadius:"0 0 10px 10px", padding:"12px 16px" },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
const ref = useRef(null);
useEffect(() => {
if (!active) return;
const canvas = ref.current; if (!canvas) return;
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const pieces = Array.from({length:120}, () => ({ x:Math.random()*canvas.width, y:-10, r:Math.random()*5+3,
d:Math.random()*80+80, color:`hsl(${Math.random()*360},70%,60%)`, tilt:Math.random()*10-5, tiltAngle:0,
tiltAngleIncrementor:Math.random()*0.07+0.05 }));
let frame; let count=0;
function animate() {
ctx.clearRect(0,0,canvas.width,canvas.height);
pieces.forEach(p => { p.tiltAngle+=p.tiltAngleIncrementor; p.y+=Math.cos(p.d)+1; p.x+=Math.sin(p.tiltAngle)*2;
p.tilt=Math.sin(p.tiltAngle)*12; ctx.beginPath(); ctx.lineWidth=p.r; ctx.strokeStyle=p.color;
ctx.moveTo(p.x+p.tilt+p.r/3,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.r/2); ctx.stroke(); });
count++; if(count<150) frame=requestAnimationFrame(animate); else { ctx.clearRect(0,0,canvas.width,canvas.height);
    onDone(); } } animate(); return ()=>cancelAnimationFrame(frame);
    }, [active]);
    if (!active) return null;
    return <canvas ref={ref} style={S.confetti} />;
    }

    function PBar({ pct, color="#818cf8", height=4 }) {
    return <div style={{height, background:"#1e2030", borderRadius:4, overflow:"hidden"}}>
        <div style={{height:"100%", width:`${Math.min(100,Math.max(0,pct))}%`, background:color, borderRadius:4,
            transition:"width 0.5s ease"}} />
    </div>;
    }

    function StatCard({ label, value, sub, pct, color="#818cf8", icon }) {
    return <div style={S.statCard}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={S.statLabel}>{label}</div>
            {icon && <span style={{fontSize:18,opacity:0.5}}>{icon}</span>}
        </div>
        <div style={S.statValue}>{value}</div>
        {sub && <div style={S.statSub}>{sub}</div>}
        {pct !== undefined &&
        <PBar pct={pct} color={color} />}
    </div>;
    }

    // LeetCode links panel
    function LCLinks({ step }) {
    const links = STEP_LEETCODE[step] || [];
    if (!links.length) return null;
    return (
    <div style={S.lcPanel}>
        <div
            style={{fontSize:10,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            <span>🔗</span> LeetCode Problems for Step {step}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {links.map((l,i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={S.lcLink}
                onMouseEnter={e=>e.currentTarget.style.background="#2c1a08"}
                onMouseLeave={e=>e.currentTarget.style.background="#1c1108"}>
                ↗ {l.title}
            </a>
            ))}
        </div>
    </div>
    );
    }

    // ─── DASHBOARD ────────────────────────────────────────────────────────────────
    function Dashboard({ dsaData, coaData, weekStatus, streak, dailyLog, setDailyLog }) {
    const [logNote, setLogNote] = useState("");
    const today = new Date().toISOString().slice(0,10);

    const dsaDone = dsaData.filter(d=>d.status==="done").length;
    const coaDone = coaData.filter(d=>d.status==="done").length;
    const totalProblems = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedProblems = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);
    const overallPct = Math.round((dsaDone+coaDone)/(dsaData.length+coaData.length)*100);
    const weeksDone = weekStatus.filter(Boolean).length;

    function addLog() {
    if (!logNote.trim()) return;
    setDailyLog(prev => [{date:today,note:logNote.trim(),ts:Date.now()},...prev.slice(0,19)]);
    setLogNote("");
    }

    const weekChartData = WEEK_PLAN.map((w,i) => {
    const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
    const cs = coaData.filter(d=>d.week===w.coaWeek);
    const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
    const tot = ds.length + cs.length;
    return { name:`W${w.week}`, pct: tot?Math.round(done/tot*100):0, color: WEEK_COLORS[i] };
    });

    const stepProgress = STRIVER_STEPS.map(s => ({
    name:`S${s.step}`, title:s.title,
    done: dsaData.filter(d=>d.step===s.step&&d.status==="done").length,
    total: s.subtopics.length,
    color: STEP_COLORS[s.step]
    }));

    return <div>
        <div style={S.pageTitle}>Good morning, Engineer 👋</div>
        <div style={{...S.pageSub, marginBottom:16}}>SRM KTR · Semester Break · Striver A2Z Sheet (474 problems) + Nesa
            COA</div>

        <div style={S.streakBox}>
            <span style={{fontSize:28}}>🔥</span>
            <div>
                <div style={{fontSize:20,fontWeight:700,color:"#fb923c"}}>{streak} day streak</div>
                <div style={{fontSize:12,color:"#64748b"}}>Consistency beats intensity. Keep coding daily!</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <input value={logNote} onChange={e=>setLogNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLog()}
                placeholder="Log today's session…" style={{...S.searchInput,width:260,marginBottom:0}}/>
                <button onClick={addLog} style={S.btn("primary")}>Log</button>
            </div>
        </div>

        <div style={S.grid4}>
            <StatCard label="DSA Subtopics" value={`${dsaDone}/${dsaData.length}`}
                pct={Math.round(dsaDone/dsaData.length*100)} color="#818cf8" icon="◈" />
            <StatCard label="Problems Solved" value={`${solvedProblems}/${totalProblems}`}
                pct={Math.round(solvedProblems/totalProblems*100)} color="#60a5fa" icon="✦" />
            <StatCard label="COA Topics" value={`${coaDone}/${coaData.length}`}
                pct={Math.round(coaDone/coaData.length*100)} color="#34d399" icon="◉" />
            <StatCard label="Overall Progress" value={`${overallPct}%`} sub={`${weeksDone}/8 weeks done`}
                pct={overallPct} color="#fb923c" icon="★" />
        </div>

        <div style={S.grid2}>
            <div style={S.card}>
                <div style={S.sectionTitle}>Weekly Progress</div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekChartData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} formatter={v=>[`${v}%`,"Progress"]}/>
                            {weekChartData.map((w,i)=>
                            <Bar key={i} dataKey="pct" fill={w.color} radius={[4,4,0,0]} />)}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Striver A2Z – Step Progress</div>
                <div style={{maxHeight:180,overflowY:"auto"}}>
                    {stepProgress.map((s,i) => <div key={i} style={{marginBottom:7}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                            <span style={{fontSize:11,color:"#94a3b8"}}>S{i+1}: {s.title}</span>
                            <span style={{fontSize:11,fontWeight:600,color:s.color}}>{s.done}/{s.total}</span>
                        </div>
                        <PBar pct={s.total?Math.round(s.done/s.total*100):0} color={s.color} height={3} />
                    </div>)}
                </div>
            </div>
        </div>

        <div style={{...S.grid2, gridTemplateColumns:"2fr 1fr"}}>
            <div style={S.card}>
                <div style={S.sectionTitle}>8-Week Roadmap</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                    {WEEK_PLAN.map((w,i) => {
                    const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
                    const cs = coaData.filter(d=>d.week===w.coaWeek);
                    const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
                    const tot = ds.length + cs.length;
                    const pct = tot ? Math.round(done/tot*100) : 0;
                    return <div key={i} style={{background:weekStatus[i]?"#0d2a1a":"#0a0b0d",border:`1px solid
                        ${weekStatus[i]?"#1a3a3a":"#1e2030"}`,borderRadius:8,padding:"10px 12px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:12,fontWeight:700,color:WEEK_COLORS[i]}}>Week {w.week}</span>
                            {weekStatus[i] && <span>✓</span>}
                        </div>
                        <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{w.title}</div>
                        <PBar pct={pct} color={WEEK_COLORS[i]} height={3} />
                        <div style={{fontSize:10,color:"#475569",marginTop:3}}>{pct}%</div>
                    </div>;
                    })}
                </div>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Daily Log</div>
                {dailyLog.length===0 && <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"16px 0"}}>
                    No entries yet.</div>}
                <div style={{maxHeight:170,overflowY:"auto"}}>
                    {dailyLog.map((l,i) => <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px                         solid #1e2030"}}>
                        <span style={{fontSize:10,color:"#475569",whiteSpace:"nowrap",marginTop:2}}>{l.date}</span>
                        <span style={{fontSize:12,color:"#94a3b8"}}>{l.note}</span>
                    </div>)}
                </div>
            </div>
        </div>
    </div>;
    }

    // ─── DSA TRACKER ─────────────────────────────────────────────────────────────
    function DSATracker({ dsaData, setDsaData }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [stepFilter, setStepFilter] = useState("all");
    const [expandedStep, setExpandedStep] = useState(null);
    const [lcExpanded, setLcExpanded] = useState(null);
    const [lcSolved, setLcSolved] = useLocalStorage("lcSolved", {});

    function toggleLcSolved(stepNum, idx) {
    const key = `lc_${stepNum}_${idx}`;
    setLcSolved(prev => ({ ...prev, [key]: !prev[key] }));
    }

    function update(id, field, val) {
    setDsaData(prev => prev.map(d => {
    if (d.id !== id) return d;
    const updated = {...d, [field]:val};
    if (field === "solved") updated.status = val>=d.problems?"done":val>0?"inprogress":"pending";
    return updated;
    }));
    }

    const totalProblems = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedProbs = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);
    const doneSubs = dsaData.filter(d=>d.status==="done").length;

    const filtered = dsaData.filter(d => {
    const q = search.toLowerCase();
    return (!q || d.topic.toLowerCase().includes(q) || d.stepTitle.toLowerCase().includes(q))
    && (filter==="all" || d.status===filter)
    && (stepFilter==="all" || String(d.step)===stepFilter);
    });

    const grouped = stepFilter !== "all" ? null :
    STRIVER_STEPS.map(s => ({...s, items:filtered.filter(d=>d.step===s.step)})).filter(s=>s.items.length>0);

    const totalLcQuestions = Object.values(STEP_LEETCODE).reduce((a,arr)=>a+arr.length,0);
    const lcSolvedCount = Object.values(lcSolved).filter(Boolean).length;

    return <div>
        <div style={S.pageTitle}>DSA Tracker</div>
        <div style={{...S.pageSub,marginBottom:12}}>Striver A2Z · 17 Steps · 474 Problems · {doneSubs}/{dsaData.length}
            subtopics · {solvedProbs}/{totalProblems} problems solved · {lcSolvedCount}/{totalLcQuestions} LC solved</div>
        <PBar pct={Math.round(solvedProbs/totalProblems*100)} color="#818cf8" height={5} />
        <div style={{marginBottom:16}} />

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
            {[{l:"Total Problems",v:totalProblems,c:"#818cf8"},{l:"Subtopics Solved",v:solvedProbs,c:"#34d399"},{l:"Subtopics Done",v:doneSubs,c:"#60a5fa"},{l:"LC Solved",v:`${lcSolvedCount}/${totalLcQuestions}`,c:"#f97316"},{l:"Completion",v:`${Math.round(solvedProbs/totalProblems*100)}%`,c:"#fb923c"}].map((s,i)=>
            <div key={i} style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:10,padding:"12px 14px"}}>
                <div style={S.statLabel}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
            )}
        </div>

        <div style={S.filterBar}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subtopics or steps…"
            style={S.searchInput}/>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={S.select}>
                <option value="all">All Status</option>
                <option value="done">Done ✓</option>
                <option value="inprogress">In Progress</option>
                <option value="pending">Pending</option>
            </select>
            <select value={stepFilter} onChange={e=>setStepFilter(e.target.value)} style={S.select}>
                <option value="all">All Steps</option>
                {STRIVER_STEPS.map(s=><option key={s.step} value={s.step}>Step {s.step}: {s.title}</option>)}
            </select>
        </div>

        {grouped ? (
        grouped.map(sg => {
        const stepDone = sg.items.filter(d=>d.status==="done").length;
        const stepProbs = sg.items.reduce((a,d)=>a+d.problems,0);
        const stepSolved = sg.items.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);
        const exp = expandedStep === sg.step;
        const lcExp = lcExpanded === sg.step;
        return <div key={sg.step} style={{marginBottom:10}}>
            <div onClick={()=>setExpandedStep(exp?null:sg.step)} style={{background:"#0f1117",border:`1px solid
                ${exp?"#2d3154":"#1e2030"}`,borderRadius: exp?"10px 10px 0 0":10,padding:"12px                 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div
                        style={{width:30,height:30,borderRadius:7,background:STEP_COLORS[sg.step]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:STEP_COLORS[sg.step]}}>
                        S{sg.step}</div>
                    <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{sg.title}</div>
                        <div style={{fontSize:11,color:"#475569"}}>{stepSolved}/{stepProbs} problems ·
                            {stepDone}/{sg.items.length} subtopics · Week {sg.week}</div>
                    </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                    {/* YouTube link */}
                    {sg.youtubeUrl && <a
                        href={sg.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        onClick={e=>e.stopPropagation()}
                        style={{...S.btn("default"),padding:"3px 9px",fontSize:11,background:"#1a0a0a",color:"#ef4444",border:"1px solid #7f1d1d",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
                        ▶ YouTube
                    </a>}
                    {/* LeetCode toggle */}
                    <button
                        onClick={e=>{e.stopPropagation();setLcExpanded(lcExp?null:sg.step);if(!exp)setExpandedStep(sg.step);}}
                        style={{...S.btn("default"),padding:"3px 9px",fontSize:11,background:lcExp?"#2c1a08":"#1e2030",color:lcExp?"#f97316":"#64748b",border:lcExp?"1px solid #431407":"none"}}>
                        🔗 LeetCode {(()=>{const lcs=STEP_LEETCODE[sg.step]||[];const solved=lcs.filter((_,i)=>lcSolved[`lc_${sg.step}_${i}`]).length;return solved>0?`(${solved}/${lcs.length})`:"";})()}
                    </button>
                    <div style={{width:80}}>
                        <PBar pct={sg.items.length?Math.round(stepDone/sg.items.length*100):0}
                            color={STEP_COLORS[sg.step]} />
                    </div>
                    <span
                        style={{fontSize:13,fontWeight:700,color:STEP_COLORS[sg.step]}}>{sg.items.length?Math.round(stepDone/sg.items.length*100):0}%</span>
                    <span style={{color:"#475569"}}>{exp?"▲":"▼"}</span>
                </div>
            </div>
            {lcExp && <div style={{background:"#0d0e12",border:"1px solid #1e2030",borderTop:"1px solid #2c1a08",padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:"0.08em"}}>
                        🔗 LeetCode Practice — Step {sg.step}: {sg.title}
                    </div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>
                        {(()=>{const lcs=STEP_LEETCODE[sg.step]||[];const solved=lcs.filter((_,i)=>lcSolved[`lc_${sg.step}_${i}`]).length;return `${solved}/${lcs.length} solved`;})()}
                    </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {(STEP_LEETCODE[sg.step]||[]).map((l,i) => {
                    const key = `lc_${sg.step}_${i}`;
                    const done = !!lcSolved[key];
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:7,background:done?"#052e16":"#0f1117",border:`1px solid ${done?"#166534":"#1e2030"}`,transition:"all 0.2s"}}>
                        <input type="checkbox" checked={done} onChange={()=>toggleLcSolved(sg.step,i)}
                            style={{width:14,height:14,accentColor:"#34d399",cursor:"pointer",flexShrink:0}}/>
                        <a href={l.url} target="_blank" rel="noopener noreferrer"
                            style={{color:done?"#86efac":"#f97316",textDecoration:"none",fontSize:12,flex:1,fontWeight:done?600:400,textDecorationLine:done?"line-through":"none",opacity:done?0.75:1}}
                            onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
                            onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
                            ↗ {l.title}
                        </a>
                        {done && <span style={{fontSize:10,color:"#4ade80",fontWeight:700}}>✓</span>}
                    </div>;
                    })}
                </div>
            </div>}
            {exp && <div style={{background:"#090a0f",border:"1px solid #1e2030",borderTop:"none",borderRadius:"0 0 10px                 10px",overflow:"hidden"}}>
                <table style={S.table}>
                    <thead>
                        <tr>
                            {["Subtopic","Problems","Solved","Confidence (0-10)","Revision?","Status"].map(h=>
                            <th key={h} style={S.th}>{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sg.items.map(d => <tr key={d.id} style={{background:d.status==="done"
                            ?"#0d1a0d":d.status==="inprogress" ?"#0d0d1a":"transparent"}}>
                            <td style={{...S.td,color:"#e2e8f0",fontWeight:500,maxWidth:320}}>{d.topic}</td>
                            <td style={S.td}>{d.problems}</td>
                            <td style={S.td}>
                                <input type="number" min={0} max={d.problems+5} value={d.solved}
                                    onChange={e=>update(d.id,"solved",Number(e.target.value))} style={S.input}/>
                            </td>
                            <td style={S.td}>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                    <input type="range" min={0} max={10} value={d.confidence}
                                        onChange={e=>update(d.id,"confidence",Number(e.target.value))}
                                    style={{width:65,accentColor:STEP_COLORS[d.step]}}/>
                                    <span
                                        style={{fontSize:11,color:STEP_COLORS[d.step],fontWeight:700,minWidth:14}}>{d.confidence}</span>
                                </div>
                            </td>
                            <td style={S.td}>
                                <input type="checkbox" checked={d.revisionRequired}
                                    onChange={e=>update(d.id,"revisionRequired",e.target.checked)} style={S.check}/>
                            </td>
                            <td style={S.td}>
                                <select value={d.status} onChange={e=>update(d.id,"status",e.target.value)}
                                    style={{...S.select,background:d.status==="done"?"#14532d":d.status==="inprogress"?"#1e1b4b":"#1a1d2e",color:d.status==="done"?"#86efac":d.status==="inprogress"?"#a5b4fc":"#94a3b8"}}>
                                    <option value="pending">Pending</option>
                                    <option value="inprogress">In Progress</option>
                                    <option value="done">Done ✓</option>
                                </select>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>}
        </div>;
        })
        ) : (
        <div style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
            <table style={S.table}>
                <thead>
                    <tr>
                        {["Step","Subtopic","Problems","Solved","Confidence","Revision?","Status"].map(h=>
                        <th key={h} style={S.th}>{h}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(d => <tr key={d.id} style={{background:d.status==="done"
                        ?"#0d1a0d":d.status==="inprogress" ?"#0d0d1a":"transparent"}}>
                        <td style={S.td}><span
                                style={{background:STEP_COLORS[d.step]+"22",color:STEP_COLORS[d.step],padding:"2px                                 7px",borderRadius:20,fontSize:10,fontWeight:700}}>S{d.step}</span></td>
                        <td style={{...S.td,color:"#e2e8f0",fontWeight:500,maxWidth:280}}>{d.topic}</td>
                        <td style={S.td}>{d.problems}</td>
                        <td style={S.td}><input type="number" min={0} max={d.problems+5} value={d.solved}
                                onChange={e=>update(d.id,"solved",Number(e.target.value))} style={S.input}/></td>
                        <td style={S.td}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                                <input type="range" min={0} max={10} value={d.confidence}
                                    onChange={e=>update(d.id,"confidence",Number(e.target.value))}
                                style={{width:65,accentColor:STEP_COLORS[d.step]}}/>
                                <span
                                    style={{fontSize:11,color:STEP_COLORS[d.step],fontWeight:700,minWidth:14}}>{d.confidence}</span>
                            </div>
                        </td>
                        <td style={S.td}><input type="checkbox" checked={d.revisionRequired}
                                onChange={e=>update(d.id,"revisionRequired",e.target.checked)} style={S.check}/></td>
                        <td style={S.td}>
                            <select value={d.status} onChange={e=>update(d.id,"status",e.target.value)}
                                style={{...S.select,background:d.status==="done"?"#14532d":d.status==="inprogress"?"#1e1b4b":"#1a1d2e",color:d.status==="done"?"#86efac":d.status==="inprogress"?"#a5b4fc":"#94a3b8"}}>
                                <option value="pending">Pending</option>
                                <option value="inprogress">In Progress</option>
                                <option value="done">Done ✓</option>
                            </select>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            {filtered.length===0 && <div style={{padding:"32px",textAlign:"center",color:"#475569"}}>No subtopics found.
            </div>}
        </div>
        )}
    </div>;
    }

    // ─── COA TRACKER ─────────────────────────────────────────────────────────────
    function COATracker({ coaData, setCoaData }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [weekFilter, setWeekFilter] = useState("all");

    function update(id, field, val) { setCoaData(prev=>prev.map(d=>d.id===id?{...d,[field]:val}:d)); }

    const filtered = coaData.filter(d => {
    const q = search.toLowerCase();
    return (!q||d.topic.toLowerCase().includes(q)||d.subtopics.toLowerCase().includes(q))
    && (filter==="all"||d.status===filter)
    && (weekFilter==="all"||String(d.week)===weekFilter);
    });
    const done = coaData.filter(d=>d.status==="done").length;

    return <div>
        <div style={S.pageTitle}>COA Tracker</div>
        <div style={{...S.pageSub,marginBottom:12}}>Nesa Academy · Computer Organization & Architecture ·
            {done}/{coaData.length} topics done</div>
        <PBar pct={Math.round(done/coaData.length*100)} color="#34d399" height={5} />
        <div style={{marginBottom:16}} />

        <div style={S.filterBar}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search COA topics…"
            style={S.searchInput}/>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={S.select}>
                <option value="all">All Status</option>
                <option value="done">Done ✓</option>
                <option value="inprogress">In Progress</option>
                <option value="pending">Pending</option>
            </select>
            <select value={weekFilter} onChange={e=>setWeekFilter(e.target.value)} style={S.select}>
                <option value="all">All Weeks</option>
                {[1,2,3,4,5,6,7,8].map(w=><option key={w} value={w}>Week {w}</option>)}
            </select>
        </div>

        <div style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
            <table style={S.table}>
                <thead>
                    <tr>
                        {["Topic","Week","Subtopics Covered","Practice                         Target","Confidence","Revision?","Status"].map(h=>
                        <th key={h} style={S.th}>{h}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(d => <tr key={d.id} style={{background:d.status==="done"
                        ?"#0d1a0d":d.status==="inprogress" ?"#0d0d1a":"transparent"}}>
                        <td style={{...S.td,color:"#e2e8f0",fontWeight:600}}>{d.topic}</td>
                        <td style={S.td}><span style={S.badge("green")}>W{d.week}</span></td>
                        <td style={{...S.td,fontSize:11,maxWidth:240}}>{d.subtopics}</td>
                        <td style={S.td}>{d.practiceTarget} sessions</td>
                        <td style={S.td}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                                <input type="range" min={0} max={10} value={d.confidence}
                                    onChange={e=>update(d.id,"confidence",Number(e.target.value))}
                                style={{width:65,accentColor:"#34d399"}}/>
                                <span
                                    style={{fontSize:11,color:"#34d399",fontWeight:700,minWidth:14}}>{d.confidence}</span>
                            </div>
                        </td>
                        <td style={S.td}><input type="checkbox" checked={d.revisionRequired}
                                onChange={e=>update(d.id,"revisionRequired",e.target.checked)} style={S.check}/></td>
                        <td style={S.td}>
                            <select value={d.status} onChange={e=>update(d.id,"status",e.target.value)}
                                style={{...S.select,background:d.status==="done"?"#14532d":d.status==="inprogress"?"#1e1b4b":"#1a1d2e",color:d.status==="done"?"#86efac":d.status==="inprogress"?"#a5b4fc":"#94a3b8"}}>
                                <option value="pending">Pending</option>
                                <option value="inprogress">In Progress</option>
                                <option value="done">Done ✓</option>
                            </select>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            {filtered.length===0 && <div style={{padding:"32px",textAlign:"center",color:"#475569"}}>No topics found.
            </div>}
        </div>
    </div>;
    }

    // ─── WEEKLY PLANNER ───────────────────────────────────────────────────────────
    function WeeklyPlanner({ dsaData, coaData, weekStatus, setWeekStatus, onCelebrate }) {
    const [expanded, setExpanded] = useState(null);
    const [lcExpanded, setLcExpanded] = useState(null);

    function toggleWeek(i) {
    const next = [...weekStatus]; next[i]=!next[i];
    if (next[i] && !weekStatus[i]) onCelebrate();
    setWeekStatus(next);
    }

    return <div>
        <div style={S.pageTitle}>Weekly Planner</div>
        <div style={S.pageSub}>8-Week Study Roadmap · Striver A2Z (17 Steps) + Nesa COA · Click to expand</div>
        {WEEK_PLAN.map((w,i) => {
        const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
        const cs = coaData.filter(d=>d.week===w.coaWeek);
        const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
        const tot = ds.length + cs.length;
        const pct = tot ? Math.round(done/tot*100) : 0;
        const exp = expanded === i;
        const lcExp = lcExpanded === i;
        const stepsInWeek = STRIVER_STEPS.filter(s=>w.dsaSteps.includes(s.step));
        // Gather all LC links for this week's steps
        const weekLCLinks = w.dsaSteps.flatMap(step => (STEP_LEETCODE[step]||[]).map(l=>({...l,step})));

        return <div key={i} style={{marginBottom:10}}>
            <div style={{background:weekStatus[i]?"#0d1a0d":"#0f1117",border:`1px solid
                ${weekStatus[i]?"#1a3a3a":exp?"#2d3154":"#1e2030"}`,borderRadius: (exp||lcExp)?"10px 10px 0                 0":10,padding:"14px                 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>
                setExpanded(exp?null:i)}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div
                        style={{width:34,height:34,borderRadius:8,background:WEEK_COLORS[i]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:WEEK_COLORS[i]}}>
                        W{w.week}</div>
                    <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{w.title}</div>
                        <div style={{fontSize:11,color:"#475569"}}>Steps {w.dsaSteps.join(", ")} · {ds.length} subtopics
                            · {cs.length} COA topics</div>
                    </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={e=>{e.stopPropagation();setLcExpanded(lcExp?null:i);}}
                        style={{...S.btn("default"),padding:"3px                         9px",fontSize:11,background:lcExp?"#2c1a08":"#1e2030",color:lcExp?"#f97316":"#64748b",border:lcExp?"1px                         solid #431407":"none"}}>
                        🔗 LeetCode ({weekLCLinks.length})
                    </button>
                    <div style={{width:100}}>
                        <PBar pct={pct} color={WEEK_COLORS[i]} />
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:WEEK_COLORS[i]}}>{pct}%</span>
                    <button onClick={e=>{e.stopPropagation();toggleWeek(i);}}
                        style={{...S.btn(weekStatus[i]?"success":"default"),padding:"4px 10px",fontSize:12}}>
                        {weekStatus[i]?"✓ Done":"Mark Done"}
                    </button>
                    <span style={{color:"#475569"}}
                        onClick={e=>{e.stopPropagation();setExpanded(exp?null:i);}}>{exp?"▲":"▼"}</span>
                </div>
            </div>

            {lcExp && <div style={{background:"#0d0e12",border:"1px solid #1e2030",borderTop:"1px solid                 #2c1a08",padding:"14px 16px"}}>
                <div
                    style={{fontSize:10,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>
                    🔗 LeetCode Problems for Week {w.week} — {w.title}
                </div>
                {w.dsaSteps.map(step => {
                const links = STEP_LEETCODE[step]||[];
                if (!links.length) return null;
                const stepInfo = STRIVER_STEPS.find(s=>s.step===step);
                return <div key={step} style={{marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:600,color:STEP_COLORS[step],marginBottom:5}}>Step {step}:
                        {stepInfo?.title}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {links.map((l,li)=>(
                        <a key={li} href={l.url} target="_blank" rel="noopener noreferrer" style={S.lcLink}
                            onMouseEnter={e=>e.currentTarget.style.background="#2c1a08"}
                            onMouseLeave={e=>e.currentTarget.style.background="#1c1108"}>
                            ↗ {l.title}
                        </a>
                        ))}
                    </div>
                </div>;
                })}
            </div>}

            {exp && <div style={{background:"#090a0f",border:"1px solid #1e2030",borderTop:"none",borderRadius:"0 0 10px                 10px",padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                    <div
                        style={{fontSize:11,fontWeight:700,color:"#818cf8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                        DSA – Striver A2Z</div>
                    {stepsInWeek.map(s => {
                    const items = dsaData.filter(d=>d.step===s.step);
                    const sDone = items.filter(d=>d.status==="done").length;
                    return <div key={s.step} style={{marginBottom:10}}>
                        <div style={{fontSize:12,fontWeight:600,color:STEP_COLORS[s.step],marginBottom:4}}>Step
                            {s.step}: {s.title} ({sDone}/{items.length})</div>
                        {items.map(d => <div key={d.id}
                            style={{display:"flex",alignItems:"flex-start",gap:6,padding:"2px 0"}}>
                            <span style={{fontSize:11,color:d.status==="done" ?"#34d399":d.status==="inprogress"
                                ?"#818cf8":"#475569",marginTop:1,flexShrink:0}}>{d.status==="done"?"✓":d.status==="inprogress"?"◑":"○"}</span>
                            <span style={{fontSize:11,color:d.status==="done"
                                ?"#64748b":"#475569",textDecoration:d.status==="done"
                                ?"line-through":"none",lineHeight:1.4}}>{d.topic} <span
                                    style={{color:"#374151"}}>({d.problems}p)</span></span>
                        </div>)}
                    </div>;
                    })}
                </div>
                <div>
                    <div
                        style={{fontSize:11,fontWeight:700,color:"#34d399",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                        COA – Nesa Academy (Week {w.coaWeek})</div>
                    {cs.map(d => <div key={d.id} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"4px                         0",borderBottom:"1px solid #1e2030"}}>
                        <span style={{fontSize:11,color:d.status==="done"
                            ?"#34d399":"#475569",marginTop:1,flexShrink:0}}>{d.status==="done"?"✓":"○"}</span>
                        <div>
                            <div style={{fontSize:12,color:d.status==="done"
                                ?"#64748b":"#94a3b8",fontWeight:500,textDecoration:d.status==="done"
                                ?"line-through":"none"}}>{d.topic}</div>
                            <div style={{fontSize:10,color:"#374151"}}>{d.subtopics}</div>
                        </div>
                    </div>)}
                </div>
            </div>}
        </div>;
        })}
    </div>;
    }

    // ─── REVISION TRACKER ────────────────────────────────────────────────────────
    function RevisionTracker({ revData, setRevData }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    function toggle(id, field) { setRevData(prev=>prev.map(d=>d.id===id?{...d,[field]:!d[field]}:d)); }

    const filtered = revData.filter(d => {
    const q = search.toLowerCase();
    return (!q||d.topic.toLowerCase().includes(q)) && (typeFilter==="all"||d.type===typeFilter);
    });

    const dayDone = revData.filter(d=>d.day).length;
    const weekDone = revData.filter(d=>d.week1).length;
    const monthDone = revData.filter(d=>d.month).length;

    return <div>
        <div style={S.pageTitle}>Revision Tracker</div>
        <div style={S.pageSub}>Spaced Repetition System · 1-day → 1-week → 1-month reviews</div>
        <div style={S.grid3}>
            <StatCard label="1-Day Done" value={`${dayDone}/${revData.length}`}
                pct={Math.round(dayDone/revData.length*100)} color="#818cf8" />
            <StatCard label="1-Week Done" value={`${weekDone}/${revData.length}`}
                pct={Math.round(weekDone/revData.length*100)} color="#34d399" />
            <StatCard label="1-Month Done" value={`${monthDone}/${revData.length}`}
                pct={Math.round(monthDone/revData.length*100)} color="#f472b6" />
        </div>

        <div style={S.filterBar}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics…"
            style={S.searchInput}/>
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={S.select}>
                <option value="all">All Types</option>
                <option value="DSA">DSA Only</option>
                <option value="COA">COA Only</option>
            </select>
        </div>

        <div style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
            <table style={S.table}>
                <thead>
                    <tr>
                        {["Topic","Type","Week",{t:"1 Day ✓",c:true},{t:"1 Week ✓",c:true},{t:"1 Month                         ✓",c:true},"Status"].map((h,i)=>
                        <th key={i} style={{...S.th,textAlign:h.c?"center":"left"}}>{h.t||h}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(d => {
                    const all = d.day&&d.week1&&d.month;
                    return <tr key={d.id} style={{background:all?"#0d1a0d":"transparent"}}>
                        <td style={{...S.td,color:"#e2e8f0",fontWeight:500}}>{d.topic}</td>
                        <td style={S.td}><span style={S.badge(d.type==="DSA" ?"blue":"green")}>{d.type}</span></td>
                        <td style={S.td}><span style={{fontSize:12,color:"#475569"}}>W{d.week}</span></td>
                        <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={d.day}
                                onChange={()=>toggle(d.id,"day")} style={S.check}/></td>
                        <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={d.week1}
                                onChange={()=>toggle(d.id,"week1")} style={S.check}/></td>
                        <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={d.month}
                                onChange={()=>toggle(d.id,"month")} style={S.check}/></td>
                        <td style={S.td}><span
                                style={{fontSize:12,color:all?"#34d399":d.day?"#818cf8":"#475569"}}>{all?"Mastered                                 ✓":d.day?"In Progress":"Not Started"}</span></td>
                    </tr>;
                    })}
                </tbody>
            </table>
        </div>
    </div>;
    }

    // ─── ANALYTICS ────────────────────────────────────────────────────────────────
    function Analytics({ dsaData, coaData, revData, weekStatus }) {
    const dsaDone = dsaData.filter(d=>d.status==="done").length;
    const coaDone = coaData.filter(d=>d.status==="done").length;
    const totalP = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedP = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);

    const stepData = STRIVER_STEPS.map(s => ({
    name:`S${s.step}`, done: dsaData.filter(d=>d.step===s.step&&d.status==="done").length,
    total: s.subtopics.length, color: STEP_COLORS[s.step]
    }));

    const weekData = WEEK_PLAN.map((w,i) => {
    const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
    const cs = coaData.filter(d=>d.week===w.coaWeek);
    const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
    const tot = ds.length + cs.length;
    return { name:`W${w.week}`, dsa:ds.length?Math.round(ds.filter(d=>d.status==="done").length/ds.length*100):0,
    coa:cs.length?Math.round(cs.filter(d=>d.status==="done").length/cs.length*100):0,
    overall:tot?Math.round(done/tot*100):0 };
    });

    const confDist = Array.from({length:11},(_,i) => ({ conf:i, dsa:dsaData.filter(d=>d.confidence===i).length,
    coa:coaData.filter(d=>d.confidence===i).length }));

    const pieData = [
    { name:"DSA Done", value:dsaDone, fill:"#818cf8" },
    { name:"DSA Left", value:dsaData.length-dsaDone, fill:"#1e2030" },
    { name:"COA Done", value:coaDone, fill:"#34d399" },
    { name:"COA Left", value:coaData.length-coaDone, fill:"#112211" },
    ];

    const revStats = [
    { name:"1-Day", done:revData.filter(d=>d.day).length, total:revData.length },
    { name:"1-Week", done:revData.filter(d=>d.week1).length, total:revData.length },
    { name:"1-Month", done:revData.filter(d=>d.month).length, total:revData.length },
    ];

    // LC stats
    const totalLC = Object.values(STEP_LEETCODE).reduce((a,v)=>a+v.length,0);

    return <div>
        <div style={S.pageTitle}>Analytics</div>
        <div style={S.pageSub}>Visual breakdown of your progress across all tracks</div>

        <div style={S.grid4}>
            <StatCard label="DSA Subtopics" value={`${Math.round(dsaDone/dsaData.length*100)}%`}
                pct={Math.round(dsaDone/dsaData.length*100)} color="#818cf8" />
            <StatCard label="Problems Solved" value={`${Math.round(solvedP/totalP*100)}%`} sub={`${solvedP}/${totalP}`}
                pct={Math.round(solvedP/totalP*100)} color="#60a5fa" />
            <StatCard label="COA Topics" value={`${Math.round(coaDone/coaData.length*100)}%`}
                pct={Math.round(coaDone/coaData.length*100)} color="#34d399" />
            <StatCard label="LeetCode Links" value={totalLC} sub="across 17 steps" color="#f97316" icon="🔗" />
        </div>

        <div style={S.grid2}>
            <div style={S.card}>
                <div style={S.sectionTitle}>Striver Step-by-Step Progress</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stepData} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} formatter={(v,n,p)=>
                            [`${v}/${p.payload.total}`,"Done"]}/>
                            {stepData.map((s,i)=>
                            <Bar key={i} dataKey="done" fill={s.color} radius={[3,3,0,0]} />)}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Weekly DSA vs COA Progress</div>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} />
                        <Line type="monotone" dataKey="dsa" stroke="#818cf8" strokeWidth={2} dot={{fill:"#818cf8",r:3}}
                            name="DSA" />
                        <Line type="monotone" dataKey="coa" stroke="#34d399" strokeWidth={2} dot={{fill:"#34d399",r:3}}
                            name="COA" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div style={S.grid2}>
            <div style={S.card}>
                <div style={S.sectionTitle}>Confidence Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={confDist.filter(d=>d.dsa+d.coa>0||d.conf===0)} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="conf" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} />
                        <Bar dataKey="dsa" fill="#818cf8" name="DSA" radius={[3,3,0,0]} />
                        <Bar dataKey="coa" fill="#34d399" name="COA" radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Revision Progress</div>
                {revStats.map((r,i) => <div key={i} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13,color:"#94a3b8"}}>{r.name} Review</span>
                        <span
                            style={{fontSize:13,fontWeight:600,color:["#818cf8","#34d399","#f472b6"][i]}}>{r.done}/{r.total}</span>
                    </div>
                    <PBar pct={Math.round(r.done/r.total*100)} color={["#818cf8","#34d399","#f472b6"][i]} height={6} />
                </div>)}
                <div style={{marginTop:16}}>
                    <div style={S.sectionTitle}>Completion Breakdown</div>
                    <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={55} dataKey="value">
                                {pieData.map((e,i)=>
                                <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                                 #1e2030",borderRadius:8,color:"#e2e8f0"}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>;
    }

    // ─── MAIN APP ─────────────────────────────────────────────────────────────────
    const NAV = [
    { id:"dashboard", label:"Dashboard", icon:"⊞" },
    { id:"dsa", label:"DSA Tracker", icon:"◈" },
    { id:"coa", label:"COA Tracker", icon:"◉" },
    { id:"weekly", label:"Weekly Planner", icon:"▦" },
    { id:"revision", label:"Revision Tracker", icon:"↺" },
    { id:"analytics", label:"Analytics", icon:"⋯" },
    ];

    export default function App() {
    const [page, setPage] = useState("dashboard");
    const [dsaData, setDsaData] = useLocalStorage("srm_dsa_v3", DSA_TABLE);
    const [coaData, setCoaData] = useLocalStorage("srm_coa_v3", COA_TABLE);
    const [revData, setRevData] = useLocalStorage("srm_rev_v3", ALL_REV_TOPICS);
    const [weekStatus, setWeekStatus] = useLocalStorage("srm_weeks_v3", Array(8).fill(false));
    const [streak, setStreak] = useLocalStorage("srm_streak_v3", 0);
    const [dailyLog, setDailyLog] = useLocalStorage("srm_log_v3", []);
    const [lastLogDate, setLastLogDate] = useLocalStorage("srm_lastlog_v3", "");
    const [confetti, setConfetti] = useState(false);

    useEffect(() => {
    const today = new Date().toISOString().slice(0,10);
    if (dailyLog.length>0 && dailyLog[0].date===today && lastLogDate!==today) {
    setLastLogDate(today); setStreak(s=>s+1);
    }
    }, [dailyLog]);

    function handleExport() {
    const blob = new
    Blob([JSON.stringify({dsaData,coaData,revData,weekStatus,streak,dailyLog},null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="srm_studyos_progress.json";
    a.click();
    }
    function handleReset() {
    if(window.confirm("Reset ALL progress? This cannot be undone.")) {
    setDsaData(DSA_TABLE); setCoaData(COA_TABLE); setRevData(ALL_REV_TOPICS);
    setWeekStatus(Array(8).fill(false)); setStreak(0); setDailyLog([]);
    }
    }

    return (
    <div style={S.app}>
        <style>
            {
                ` @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

                ::-webkit-scrollbar {
                    width: 4px;
                    height: 4px
                }

                ::-webkit-scrollbar-track {
                    background: #0a0b0d
                }

                ::-webkit-scrollbar-thumb {
                    background: #1e2030;
                    border-radius: 4px
                }

                select option {
                    background: #1a1d2e;
                    color: #e2e8f0
                }

                input[type=number]::-webkit-inner-spin-button {
                    opacity: 0.4
                }

                tr:hover td {
                    background: rgba(255, 255, 255, 0.01)
                }

                `
            }
        </style>
        <Confetti active={confetti} onDone={()=>setConfetti(false)}/>
            <div style={S.sidebar}>
                <div style={S.sidebarTop}>
                    <div style={S.logo}>StudyOS</div>
                    <div style={S.logoSub}>SRM KTR · Sem Break</div>
                </div>
                <nav style={S.nav}>
                    {NAV.map(n=><div key={n.id} onClick={()=>setPage(n.id)} style={S.navItem(page===n.id)}>
                        <span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span>
                    </div>)}
                </nav>
                <div style={{padding:"12px 8px",borderTop:"1px solid #1e2030"}}>
                    <div onClick={handleExport} style={{...S.navItem(false),marginBottom:4}}>
                        <span style={{fontSize:13}}>↓</span><span style={{fontSize:12}}>Export JSON</span>
                    </div>
                    <div onClick={handleReset} style={{...S.navItem(false),color:"#7f1d1d"}}>
                        <span style={{fontSize:13}}>⟲</span><span style={{fontSize:12}}>Reset Progress</span>
                    </div>
                </div>
            </div>
            <main style={S.main}>
                {page==="dashboard" &&
                <Dashboard dsaData={dsaData} coaData={coaData} weekStatus={weekStatus} streak={streak}
                    dailyLog={dailyLog} setDailyLog={setDailyLog} />}
                {page==="dsa" &&
                <DSATracker dsaData={dsaData} setDsaData={setDsaData} />}
                {page==="coa" &&
                <COATracker coaData={coaData} setCoaData={setCoaData} />}
                {page==="weekly" && <WeeklyPlanner dsaData={dsaData} coaData={coaData} weekStatus={weekStatus}
                    setWeekStatus={setWeekStatus} onCelebrate={()=>setConfetti(true)}/>}
                    {page==="revision" &&
                    <RevisionTracker revData={revData} setRevData={setRevData} />}
                    {page==="analytics" &&
                    <Analytics dsaData={dsaData} coaData={coaData} revData={revData} weekStatus={weekStatus} />}
            </main>
    </div>
    );
    }