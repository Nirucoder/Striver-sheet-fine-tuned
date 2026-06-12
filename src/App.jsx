import { useState, useEffect, useRef, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";


// ─── STRIVER A2Z SHEET DATA (NEW NESTED STRUCTURE) ─────────────────────────
const STRIVER_STEPS = [
{ step:1, title:"Learn the Basics", week:1, subtopics:[
  { name:"Things to Know in C++, Java, Python or any language", problems:[
      { title:"User Input / Output", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/user-input-output-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"Data Types", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/data-types-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"If Else statements", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/if-else-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"Switch Statement", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/switch-statement-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"arrays, strings", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/arrays-and-strings-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"For loops, while loops", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/loops-in-c/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Build-up Logical Thinking", problems:[
      { title:"Pattern 1", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-1/", practice:"https://takeuforward.org/plus" },
      { title:"Pattern 2", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-2/", practice:"https://takeuforward.org/plus" },
      { title:"Pattern 3", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-3/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Learn STL", problems:[
      { title:"Pairs, Vectors, Maps, Sets", yt:"https://youtu.be/RRVYpIET_RU", article:"https://takeuforward.org/c/c-stl-tutorial-for-beginners/", practice:"https://takeuforward.org/plus" }
  ]},
  { name:"Know Basic Maths", problems:[
      { title:"Count Digits", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/count-digits-in-a-number/", practice:"https://leetcode.com/problems/count-primes/" },
      { title:"Reverse a Number", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/reverse-a-number/", practice:"https://leetcode.com/problems/reverse-integer/" },
      { title:"Check Palindrome", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-palindrome-or-not/", practice:"https://leetcode.com/problems/palindrome-number/" },
      { title:"GCD Or HCF", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/find-gcd-of-two-numbers/", practice:"https://leetcode.com/problems/find-greatest-common-divisor-of-array/" },
      { title:"Armstrong Numbers", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-armstrong-number-or-not/", practice:"https://leetcode.com/problems/armstrong-number/" },
      { title:"Print all Divisors", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/print-all-divisors-of-a-given-number/", practice:"https://takeuforward.org/plus" },
      { title:"Check for Prime", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-prime-or-not/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Learn Basic Recursion", problems:[
      { title:"Understand recursion by print something N times", yt:"https://youtu.be/yVdKa8dnKiE", article:"https://takeuforward.org/recursion/print-name-n-times-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Print 1 to N using recursion", yt:"https://youtu.be/un6PLygfXrA", article:"https://takeuforward.org/recursion/print-1-to-n-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Print N to 1 using recursion", yt:"https://youtu.be/un6PLygfXrA", article:"https://takeuforward.org/recursion/print-n-to-1-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Sum of first N numbers", yt:"https://youtu.be/69ZCDFy-OUo", article:"https://takeuforward.org/recursion/sum-of-first-n-natural-numbers/", practice:"https://takeuforward.org/plus" },
      { title:"Factorial of N numbers", yt:"https://youtu.be/69ZCDFy-OUo", article:"https://takeuforward.org/recursion/factorial-of-a-number-iterative-and-recursive/", practice:"https://takeuforward.org/plus" },
      { title:"Reverse an array", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/data-structure/reverse-a-given-array/", practice:"https://leetcode.com/problems/reverse-string/" },
      { title:"Check if a string is palindrome or not", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/data-structure/check-if-the-given-string-is-palindrome-or-not/", practice:"https://leetcode.com/problems/valid-palindrome/" },
      { title:"Fibonacci Number", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/arrays/print-fibonacci-series-up-to-n-th-term/", practice:"https://leetcode.com/problems/fibonacci-number/" },
  ]},
  { name:"Learn Basic Hashing", problems:[
      { title:"Counting frequencies of array elements", yt:"https://youtu.be/KEs5UyBJ39g", article:"https://takeuforward.org/data-structure/count-frequency-of-each-element-in-the-array/", practice:"https://takeuforward.org/plus" },
      { title:"Find the highest/lowest frequency element", yt:"https://youtu.be/KEs5UyBJ39g", article:"https://takeuforward.org/arrays/find-the-highest-lowest-frequency-element/", practice:"https://takeuforward.org/plus" }
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Reverse Integer", practice:"https://leetcode.com/problems/reverse-integer/" },
      { title:"Palindrome Number", practice:"https://leetcode.com/problems/palindrome-number/" },
      { title:"Single Number", practice:"https://leetcode.com/problems/single-number/" },
      { title:"Contains Duplicate", practice:"https://leetcode.com/problems/contains-duplicate/" },
      { title:"Move Zeroes", practice:"https://leetcode.com/problems/move-zeroes/" },
      { title:"Remove Duplicates from Sorted Array", practice:"https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
      { title:"Plus One", practice:"https://leetcode.com/problems/plus-one/" },
      { title:"Fibonacci Number", practice:"https://leetcode.com/problems/fibonacci-number/" },
      { title:"Climbing Stairs", practice:"https://leetcode.com/problems/climbing-stairs/" },
      { title:"Two Sum", practice:"https://leetcode.com/problems/two-sum/" },
      { title:"Power of Two", practice:"https://leetcode.com/problems/power-of-two/" },
      { title:"Majority Element", practice:"https://leetcode.com/problems/majority-element/" },
      { title:"Find All Numbers Disappeared in Array", practice:"https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/" },
      { title:"Reverse String", practice:"https://leetcode.com/problems/reverse-string/" },
      { title:"First Unique Character in a String", practice:"https://leetcode.com/problems/first-unique-character-in-a-string/" },
      { title:"Intersection of Two Arrays II", practice:"https://leetcode.com/problems/intersection-of-two-arrays-ii/" },
      { title:"Valid Palindrome", practice:"https://leetcode.com/problems/valid-palindrome/" },
      { title:"Maximum Average Subarray I", practice:"https://leetcode.com/problems/maximum-average-subarray-i/" },
      { title:"Missing Number", practice:"https://leetcode.com/problems/missing-number/" },
      { title:"Number of Good Pairs", practice:"https://leetcode.com/problems/number-of-good-pairs/" },
  ]}
]},
{ step:2, title:"Learn Important Sorting Techniques", week:1, subtopics:[
  { name:"Sorting-I", problems:[
      { title:"Selection Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/selection-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Bubble Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/bubble-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Insertion Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/insertion-sort-algorithm/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Sorting-II", problems:[
      { title:"Merge Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/data-structure/merge-sort-algorithm/", practice:"https://leetcode.com/problems/sort-an-array/" },
      { title:"Recursive Bubble Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/arrays/recursive-bubble-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Recursive Insertion Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/arrays/recursive-insertion-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Quick Sort", yt:"https://youtu.be/WIrA4YexLRQ", article:"https://takeuforward.org/data-structure/quick-sort-algorithm/", practice:"https://leetcode.com/problems/sort-an-array/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Sort an Array", practice:"https://leetcode.com/problems/sort-an-array/" },
      { title:"Sort Colors (Dutch National Flag)", practice:"https://leetcode.com/problems/sort-colors/" },
      { title:"Kth Largest Element in an Array", practice:"https://leetcode.com/problems/kth-largest-element-in-an-array/" },
      { title:"Merge Sorted Array", practice:"https://leetcode.com/problems/merge-sorted-array/" },
      { title:"Sort List (Linked List)", practice:"https://leetcode.com/problems/sort-list/" },
      { title:"Largest Number", practice:"https://leetcode.com/problems/largest-number/" },
      { title:"Count of Smaller Numbers After Self", practice:"https://leetcode.com/problems/count-of-smaller-numbers-after-self/" },
      { title:"Reverse Pairs", practice:"https://leetcode.com/problems/reverse-pairs/" },
      { title:"Wiggle Sort II", practice:"https://leetcode.com/problems/wiggle-sort-ii/" },
      { title:"Maximum Gap", practice:"https://leetcode.com/problems/maximum-gap/" },
      { title:"Sort Array by Parity", practice:"https://leetcode.com/problems/sort-array-by-parity/" },
      { title:"Sort Array by Parity II", practice:"https://leetcode.com/problems/sort-array-by-parity-ii/" },
      { title:"Pancake Sorting", practice:"https://leetcode.com/problems/pancake-sorting/" },
      { title:"H-Index", practice:"https://leetcode.com/problems/h-index/" },
      { title:"Relative Sort Array", practice:"https://leetcode.com/problems/relative-sort-array/" },
      { title:"Find Minimum in Rotated Sorted Array", practice:"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
      { title:"Meeting Rooms II (Min Platforms)", practice:"https://leetcode.com/problems/meeting-rooms-ii/" },
  ]}
]},
{ step:3, title:"Solve Problems on Arrays", week:2, subtopics:[
  { name:"Easy", problems:[
      { title:"Largest Element in Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/find-the-largest-element-in-an-array/", practice:"https://takeuforward.org/plus" },
      { title:"Second Largest Element in Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/find-second-smallest-and-second-largest-element-in-an-array/", practice:"https://takeuforward.org/plus" },
      { title:"Check if array is sorted", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/check-if-an-array-is-sorted/", practice:"https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/" },
      { title:"Remove Duplicates from Sorted Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/remove-duplicates-in-place-from-sorted-array/", practice:"https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
      { title:"Left Rotate the Array by One", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/left-rotate-the-array-by-one/", practice:"https://takeuforward.org/plus" },
      { title:"Rotate array by K elements", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/rotate-array-by-k-elements/", practice:"https://leetcode.com/problems/rotate-array/" },
      { title:"Move Zeroes to End", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/move-all-zeros-to-the-end-of-the-array/", practice:"https://leetcode.com/problems/move-zeroes/" },
      { title:"Linear Search", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/linear-search-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"Union of Two Sorted Arrays", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/union-of-two-sorted-arrays/", practice:"https://takeuforward.org/plus" },
      { title:"Find missing number in an array", yt:"https://youtu.be/581L8kC8A_E", article:"https://takeuforward.org/arrays/find-the-missing-number-in-an-array/", practice:"https://leetcode.com/problems/missing-number/" },
      { title:"Maximum Consecutive Ones", yt:"https://youtu.be/bYWLJb3vCWY", article:"https://takeuforward.org/data-structure/count-maximum-consecutive-ones-in-the-array/", practice:"https://leetcode.com/problems/max-consecutive-ones/" },
      { title:"Find the number that appears once", yt:"https://youtu.be/bYWLJb3vCWY", article:"https://takeuforward.org/arrays/find-the-number-that-appears-once-and-the-other-numbers-twice/", practice:"https://leetcode.com/problems/single-number/" },
  ]},
  { name:"Medium", problems:[
      { title:"Two Sum", yt:"https://youtu.be/UXDSeD9mN-k", article:"https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", practice:"https://leetcode.com/problems/two-sum/" },
      { title:"Sort Colors (Dutch Flag)", yt:"https://youtu.be/tp8JIuCXBaU", article:"https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/", practice:"https://leetcode.com/problems/sort-colors/" },
      { title:"Majority Element (>N/2 times)", yt:"https://youtu.be/nP_ns3uSh80", article:"https://takeuforward.org/data-structure/find-the-majority-element-that-occurs-more-than-n-2-times/", practice:"https://leetcode.com/problems/majority-element/" },
      { title:"Kadane's Algorithm – Max Subarray Sum", yt:"https://youtu.be/AHZpyENo7kM", article:"https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/", practice:"https://leetcode.com/problems/maximum-subarray/" },
      { title:"Best Time to Buy and Sell Stock", yt:"https://youtu.be/ioFPBdChabY", article:"https://takeuforward.org/data-structure/stock-buy-and-sell/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
      { title:"Rearrange Array Elements by Sign", yt:"https://youtu.be/h4aBagy4dhw", article:"https://takeuforward.org/data-structure/rearrange-array-elements-by-sign/", practice:"https://leetcode.com/problems/rearrange-array-elements-by-sign/" },
      { title:"Next Permutation", yt:"https://youtu.be/JDOXKqF60RQ", article:"https://takeuforward.org/data-structure/next_permutation-find-next-lexicographically-greater-permutation/", practice:"https://leetcode.com/problems/next-permutation/" },
      { title:"Leaders in an Array", yt:"https://youtu.be/cHrE-bPSzJE", article:"https://takeuforward.org/data-structure/leaders-in-an-array/", practice:"https://takeuforward.org/plus" },
      { title:"Longest Consecutive Sequence", yt:"https://youtu.be/oO5uLE8zzDk", article:"https://takeuforward.org/data-structure/longest-consecutive-sequence-in-an-array/", practice:"https://leetcode.com/problems/longest-consecutive-sequence/" },
      { title:"Set Matrix Zeroes", yt:"https://youtu.be/N0MgLvceX7M", article:"https://takeuforward.org/data-structure/set-matrix-zero/", practice:"https://leetcode.com/problems/set-matrix-zeroes/" },
      { title:"Rotate Matrix 90 Degrees", yt:"https://youtu.be/Z0R2u6gd3GU", article:"https://takeuforward.org/data-structure/rotate-image-by-90-degree/", practice:"https://leetcode.com/problems/rotate-image/" },
      { title:"Spiral Order Matrix", yt:"https://youtu.be/3Zv1bkPnOPQ", article:"https://takeuforward.org/data-structure/spiral-traversal-of-matrix/", practice:"https://leetcode.com/problems/spiral-matrix/" },
      { title:"Subarray with Given Sum (Pos+Neg)", yt:"https://youtu.be/xvNwoz-ufXA", article:"https://takeuforward.org/data-structure/longest-subarray-with-sum-k/", practice:"https://leetcode.com/problems/subarray-sum-equals-k/" },
  ]},
  { name:"Hard", problems:[
      { title:"Pascal's Triangle", yt:"https://youtu.be/bR7mQgwQ_o8", article:"https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/", practice:"https://leetcode.com/problems/pascals-triangle/" },
      { title:"Majority Element (>N/3 times)", yt:"https://youtu.be/vwZj1K0e9U8", article:"https://takeuforward.org/data-structure/majority-elements-n-3-times-find-the-elements-that-appears-more-than-n-3-times-in-the-array/", practice:"https://leetcode.com/problems/majority-element-ii/" },
      { title:"3-Sum", yt:"https://youtu.be/onLoX6Nhvmg", article:"https://takeuforward.org/data-structure/3-sum-find-triplets-that-add-up-to-a-zero/", practice:"https://leetcode.com/problems/3sum/" },
      { title:"4-Sum", yt:"https://youtu.be/eD95WRfh81c", article:"https://takeuforward.org/data-structure/4-sum-find-quads-that-add-up-to-a-target-value/", practice:"https://leetcode.com/problems/4sum/" },
      { title:"Maximum Product Subarray", yt:"https://youtu.be/hnswaLJvr6g", article:"https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/", practice:"https://leetcode.com/problems/maximum-product-subarray/" },
      { title:"Merge Overlapping Sub-intervals", yt:"https://youtu.be/IexN60k62jo", article:"https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/", practice:"https://leetcode.com/problems/merge-intervals/" },
      { title:"Merge Two Sorted Arrays Without Extra Space", yt:"https://youtu.be/n7uwj04E0I4", article:"https://takeuforward.org/data-structure/merge-two-sorted-arrays-without-extra-space/", practice:"https://leetcode.com/problems/merge-sorted-array/" },
      { title:"Find the Repeating and Missing Number", yt:"https://youtu.be/2D0D8HE6uak", article:"https://takeuforward.org/data-structure/find-the-repeating-and-missing-numbers/", practice:"https://takeuforward.org/plus" },
      { title:"Count Inversions in Array (Merge Sort)", yt:"https://youtu.be/AseUmwVNaoY", article:"https://takeuforward.org/data-structure/count-inversions-in-an-array/", practice:"https://leetcode.com/problems/count-of-smaller-numbers-after-self/" },
      { title:"Reverse Pairs (Merge Sort)", yt:"https://youtu.be/S6rsAlj_iB4", article:"https://takeuforward.org/data-structure/count-reverse-pairs/", practice:"https://leetcode.com/problems/reverse-pairs/" },
      { title:"Maximum Sum Rectangle in Matrix", yt:"https://youtu.be/1jOeEwxTDow", article:"https://takeuforward.org/data-structure/maximum-sum-rectangle/", practice:"https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/" },
  ]}
]},
{ step:4, title:"Binary Search [1D, 2D Arrays, Search Space]", week:3, subtopics:[
  { name:"BS on 1D Arrays", problems:[
      { title:"Binary Search Introduction", yt:"https://youtu.be/W9QJ8HaRvJQ", article:"https://takeuforward.org/data-structure/binary-search-explained/", practice:"https://leetcode.com/problems/binary-search/" },
      { title:"Implement Lower Bound", yt:"https://youtu.be/6zhGS79oQ4k", article:"https://takeuforward.org/data-structure/implement-lower-bound/", practice:"https://leetcode.com/problems/search-insert-position/" },
      { title:"Implement Upper Bound", yt:"https://youtu.be/6zhGS79oQ4k", article:"https://takeuforward.org/data-structure/implement-upper-bound/", practice:"https://leetcode.com/problems/search-insert-position/" },
      { title:"Search Insert Position", yt:"https://youtu.be/6zhGS79oQ4k", article:"https://takeuforward.org/data-structure/search-insert-position/", practice:"https://leetcode.com/problems/search-insert-position/" },
      { title:"Floor and Ceil in Sorted Array", yt:"https://youtu.be/6zhGS79oQ4k", article:"https://takeuforward.org/data-structure/floor-and-ceil-in-sorted-array/", practice:"https://takeuforward.org/plus" },
      { title:"First and Last Occurrence of X", yt:"https://youtu.be/hjR1IYVx9lY", article:"https://takeuforward.org/data-structure/last-occurrence-in-a-sorted-array/", practice:"https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
      { title:"Count Occurrences in Sorted Array", yt:"https://youtu.be/hjR1IYVx9lY", article:"https://takeuforward.org/data-structure/count-occurrences-in-sorted-array/", practice:"https://takeuforward.org/plus" },
      { title:"Search in Rotated Sorted Array I", yt:"https://youtu.be/5qGrJbHhqFs", article:"https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array/", practice:"https://leetcode.com/problems/search-in-rotated-sorted-array/" },
      { title:"Search in Rotated Sorted Array II (Duplicates)", yt:"https://youtu.be/w2G2W8l__pc", article:"https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array-ii/", practice:"https://leetcode.com/problems/search-in-rotated-sorted-array-ii/" },
      { title:"Minimum in Rotated Sorted Array", yt:"https://youtu.be/Ril1tCeB1wU", article:"https://takeuforward.org/data-structure/minimum-element-in-a-rotated-sorted-array/", practice:"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
      { title:"Single Element in a Sorted Array", yt:"https://youtu.be/l1ED7bG5nP0", article:"https://takeuforward.org/data-structure/single-element-in-a-sorted-array/", practice:"https://leetcode.com/problems/single-element-in-a-sorted-array/" },
      { title:"Find Peak Element", yt:"https://youtu.be/cXxmbemS6XM", article:"https://takeuforward.org/data-structure/peak-element-in-array/", practice:"https://leetcode.com/problems/find-peak-element/" },
  ]},
  { name:"BS on Answers", problems:[
      { title:"Find Sqrt of a Number", yt:"https://youtu.be/Bsv3FPUX_BA", article:"https://takeuforward.org/binary-search/finding-sqrt-of-a-number-using-binary-search/", practice:"https://leetcode.com/problems/sqrtx/" },
      { title:"Find the Nth Root of a Number", yt:"https://youtu.be/WjpswYrS2nY", article:"https://takeuforward.org/data-structure/find-nth-root-of-m/", practice:"https://takeuforward.org/plus" },
      { title:"Koko Eating Bananas", yt:"https://youtu.be/qyfekrNni90", article:"https://takeuforward.org/binary-search/koko-eating-bananas/", practice:"https://leetcode.com/problems/koko-eating-bananas/" },
      { title:"Minimum Days to Make M Bouquets", yt:"https://youtu.be/TXAuxeYBTdg", article:"https://takeuforward.org/binary-search/minimum-days-to-make-m-bouquets/", practice:"https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/" },
      { title:"Find the Smallest Divisor", yt:"https://youtu.be/UvTMuf1LD5k", article:"https://takeuforward.org/binary-search/find-the-smallest-divisor-given-a-threshold/", practice:"https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/" },
      { title:"Capacity to Ship Packages", yt:"https://youtu.be/s1YMbOVdZ8s", article:"https://takeuforward.org/binary-search/capacity-to-ship-packages-within-d-days/", practice:"https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/" },
      { title:"Aggressive Cows", yt:"https://youtu.be/R_Mfw4ew-Vo", article:"https://takeuforward.org/data-structure/aggressive-cows-detailed-solution/", practice:"https://www.spoj.com/problems/AGGRCOWS/" },
      { title:"Book Allocation Problem", yt:"https://youtu.be/Z0hwjftStI4", article:"https://takeuforward.org/data-structure/allocate-minimum-number-of-pages/", practice:"https://leetcode.com/problems/allocate-books/" },
      { title:"Split Array – Largest Sum", yt:"https://youtu.be/thUd_WJn6wk", article:"https://takeuforward.org/arrays/split-array-largest-sum/", practice:"https://leetcode.com/problems/split-array-largest-sum/" },
      { title:"Painter's Partition Problem", yt:"https://youtu.be/thUd_WJn6wk", article:"https://takeuforward.org/data-structure/painters-partition-problem/", practice:"https://www.interviewbit.com/problems/painters-partition-problem/" },
      { title:"Minimize Max Distance between Gas Stations", yt:"https://youtu.be/kpas4GjFRfY", article:"https://takeuforward.org/data-structure/minimise-maximum-distance-between-petrol-pumps/", practice:"https://leetcode.com/problems/minimize-max-distance-to-gas-station/" },
      { title:"Median of Two Sorted Arrays", yt:"https://youtu.be/C2rRzz-JDk8", article:"https://takeuforward.org/data-structure/median-of-two-sorted-arrays-of-different-sizes/", practice:"https://leetcode.com/problems/median-of-two-sorted-arrays/" },
      { title:"Kth Element of Two Sorted Arrays", yt:"https://youtu.be/q13SLMwVTi4", article:"https://takeuforward.org/data-structure/k-th-element-of-two-sorted-arrays/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"BS on 2D Arrays", problems:[
      { title:"Row with Maximum 1s", yt:"https://youtu.be/SCz-1TtYxDI", article:"https://takeuforward.org/data-structure/row-with-maximum-1s/", practice:"https://leetcode.com/problems/row-with-maximum-ones/" },
      { title:"Search in a 2D Matrix", yt:"https://youtu.be/JXU4Akft7yk", article:"https://takeuforward.org/data-structure/search-in-a-2d-matrix/", practice:"https://leetcode.com/problems/search-a-2d-matrix/" },
      { title:"Search in a 2D Matrix II", yt:"https://youtu.be/9ZbB397jU4k", article:"https://takeuforward.org/data-structure/search-in-a-sorted-2d-matrix/", practice:"https://leetcode.com/problems/search-a-2d-matrix-ii/" },
      { title:"Find Peak Element in 2D Matrix", yt:"https://youtu.be/oRhOUq6CfhI", article:"https://takeuforward.org/data-structure/find-peak-element-in-2d-grid/", practice:"https://leetcode.com/problems/find-a-peak-element-ii/" },
      { title:"Median in a Row-Wise Sorted Matrix", yt:"https://youtu.be/63fPPOdIr2c", article:"https://takeuforward.org/data-structure/median-of-row-wise-sorted-matrix/", practice:"https://www.interviewbit.com/problems/median-of-array/" },
  ]}
]},
{ step:5, title:"Strings [Basic and Medium]", week:3, subtopics:[
  { name:"Basic String Problems", problems:[
      { title:"Remove Outermost Parentheses", yt:"https://youtu.be/RXGkNQGFHgE", article:"https://takeuforward.org/data-structure/remove-outermost-parentheses/", practice:"https://leetcode.com/problems/remove-outermost-parentheses/" },
      { title:"Reverse Words in a String", yt:"https://youtu.be/AEgkh-nI8jQ", article:"https://takeuforward.org/data-structure/reverse-words-in-a-string/", practice:"https://leetcode.com/problems/reverse-words-in-a-string/" },
      { title:"Largest Odd Number in a String", yt:"https://youtu.be/vk-bNDp58X4", article:"https://takeuforward.org/data-structure/largest-odd-number-in-a-string/", practice:"https://leetcode.com/problems/largest-odd-number-in-string/" },
      { title:"Longest Common Prefix", yt:"https://youtu.be/x1UcklEMfSc", article:"https://takeuforward.org/data-structure/longest-common-prefix/", practice:"https://leetcode.com/problems/longest-common-prefix/" },
      { title:"Isomorphic Strings", yt:"https://youtu.be/mMonZHVNwgk", article:"https://takeuforward.org/data-structure/check-if-two-strings-are-isomorphic/", practice:"https://leetcode.com/problems/isomorphic-strings/" },
      { title:"Check if Strings are Rotations", yt:"https://youtu.be/7I9KN3PVHUY", article:"https://takeuforward.org/data-structure/check-if-string-is-rotation-of-another-string/", practice:"https://leetcode.com/problems/rotate-string/" },
      { title:"Check if String is Anagram", yt:"https://youtu.be/eXgzuKTCCio", article:"https://takeuforward.org/data-structure/check-whether-two-strings-are-anagram-of-each-other/", practice:"https://leetcode.com/problems/valid-anagram/" },
  ]},
  { name:"Medium String Problems", problems:[
      { title:"Sum of Beauty of All Substrings", yt:"https://youtu.be/vFZTxvUkNlk", article:"https://takeuforward.org/data-structure/sum-of-beauty-of-all-substrings/", practice:"https://leetcode.com/problems/sum-of-beauty-of-all-substrings/" },
      { title:"Minimum Characters to Make String Palindrome", yt:"https://youtu.be/eXyniy96SiU", article:"https://takeuforward.org/data-structure/minimum-characters-for-palindrome/", practice:"https://takeuforward.org/plus" },
      { title:"Valid Palindrome II", yt:"https://youtu.be/JrxobOHMEhU", article:"https://takeuforward.org/data-structure/valid-palindrome-ii/", practice:"https://leetcode.com/problems/valid-palindrome-ii/" },
      { title:"Longest Palindromic Substring", yt:"https://youtu.be/XYQecbcd6_c", article:"https://takeuforward.org/data-structure/longest-palindromic-substring/", practice:"https://leetcode.com/problems/longest-palindromic-substring/" },
      { title:"Roman to Integer", yt:"https://youtu.be/IFSMc_cAaTc", article:"https://takeuforward.org/data-structure/roman-number-to-integer-and-vice-versa/", practice:"https://leetcode.com/problems/roman-to-integer/" },
      { title:"Integer to Roman", yt:"https://youtu.be/ZMLKhYvJNd4", article:"https://takeuforward.org/data-structure/integer-to-roman/", practice:"https://leetcode.com/problems/integer-to-roman/" },
      { title:"String to Integer (atoi)", yt:"https://youtu.be/n3Jj4Jg4yne", article:"https://takeuforward.org/data-structure/implement-atoi/", practice:"https://leetcode.com/problems/string-to-integer-atoi/" },
      { title:"Count and Say", yt:"https://youtu.be/8I1lHEHFr0E", article:"https://takeuforward.org/data-structure/count-and-say/", practice:"https://leetcode.com/problems/count-and-say/" },
      { title:"Implement strStr (KMP Algorithm)", yt:"https://youtu.be/JoF0Z7nVSrA", article:"https://takeuforward.org/data-structure/kmp-algorithm/", practice:"https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/" },
      { title:"Repeated String Match", yt:"https://youtu.be/fOOiHWw10XQ", article:"https://takeuforward.org/data-structure/repeated-string-match/", practice:"https://leetcode.com/problems/repeated-string-match/" },
  ]}
]},
{ step:6, title:"Learn LinkedList [Single LL, Double LL, Medium, Hard, FAQs]", week:4, subtopics:[
  { name:"Learn Single Linked List", problems:[
      { title:"Introduction to Linked List", yt:"https://youtu.be/Nq7ok-OyEpg", article:"https://takeuforward.org/linked-list/introduction-to-linked-list/", practice:"https://leetcode.com/problems/design-linked-list/" },
      { title:"Insert at Head, Tail, Kth Position", yt:"https://youtu.be/rnYHa90k4pE", article:"https://takeuforward.org/linked-list/inserting-a-node-in-linked-list/", practice:"https://leetcode.com/problems/design-linked-list/" },
      { title:"Delete Node in Linked List", yt:"https://youtu.be/QHvoZsCROpQ", article:"https://takeuforward.org/data-structure/delete-last-node-of-linked-list/", practice:"https://leetcode.com/problems/delete-node-in-a-linked-list/" },
      { title:"Search in Linked List", yt:"https://youtu.be/W_CPMDsRDEU", article:"https://takeuforward.org/linked-list/search-an-element-in-linked-list/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Learn Doubly Linked List", problems:[
      { title:"Introduction to DLL", yt:"https://youtu.be/e9NG717E6fI", article:"https://takeuforward.org/data-structure/introduction-to-doubly-linked-list/", practice:"https://leetcode.com/problems/design-linked-list/" },
      { title:"Insert and Delete in DLL", yt:"https://youtu.be/wr7t6nQtJqg", article:"https://takeuforward.org/data-structure/delete-a-node-in-doubly-linked-list/", practice:"https://leetcode.com/problems/design-linked-list/" },
      { title:"Reverse a DLL", yt:"https://youtu.be/BJHpDc9c8pc", article:"https://takeuforward.org/data-structure/reverse-a-doubly-linked-list/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Medium Problems on LL", problems:[
      { title:"Middle of the Linked List", yt:"https://youtu.be/G0_I-ZF0S38", article:"https://takeuforward.org/data-structure/find-middle-element-in-a-linked-list/", practice:"https://leetcode.com/problems/middle-of-the-linked-list/" },
      { title:"Reverse a Linked List", yt:"https://youtu.be/Mu_aCxnS2_8", article:"https://takeuforward.org/data-structure/reverse-a-linked-list/", practice:"https://leetcode.com/problems/reverse-linked-list/" },
      { title:"Detect a Loop in LL (Floyd's Algorithm)", yt:"https://youtu.be/6BsBjpt9pCU", article:"https://takeuforward.org/data-structure/detect-a-cycle-in-a-linked-list/", practice:"https://leetcode.com/problems/linked-list-cycle/" },
      { title:"Find Starting Point of Loop in LL", yt:"https://youtu.be/QfbstLVErp4", article:"https://takeuforward.org/data-structure/starting-point-of-loop-in-a-linked-list/", practice:"https://leetcode.com/problems/linked-list-cycle-ii/" },
      { title:"Check Palindrome in LL", yt:"https://youtu.be/lRY_G-u_8jk", article:"https://takeuforward.org/data-structure/check-if-linked-list-is-palindrome/", practice:"https://leetcode.com/problems/palindrome-linked-list/" },
      { title:"Segregate Odd and Even Nodes", yt:"https://youtu.be/qf6qp7GzD5Q", article:"https://takeuforward.org/data-structure/segregate-odd-and-even-nodes-in-linked-list/", practice:"https://leetcode.com/problems/odd-even-linked-list/" },
      { title:"Remove Nth Node from End", yt:"https://youtu.be/AdnBqyBBLvs", article:"https://takeuforward.org/data-structure/remove-nth-node-from-the-back-of-the-linked-list/", practice:"https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
      { title:"Delete the Middle Node", yt:"https://youtu.be/ePaUbEPITuw", article:"https://takeuforward.org/data-structure/delete-the-middle-node-of-linked-list/", practice:"https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/" },
      { title:"Sort LL using Merge Sort", yt:"https://youtu.be/8ocB7a_c-Cc", article:"https://takeuforward.org/data-structure/sort-linked-list/", practice:"https://leetcode.com/problems/sort-list/" },
      { title:"Sort 0s, 1s, 2s in LL", yt:"https://youtu.be/gRII7LhdJWc", article:"https://takeuforward.org/data-structure/sort-linked-list-of-0s-1s-2s/", practice:"https://takeuforward.org/plus" },
      { title:"Find the Intersection Point of Y LL", yt:"https://youtu.be/0DYoPz2Tpt4", article:"https://takeuforward.org/data-structure/find-intersection-of-two-linked-lists/", practice:"https://leetcode.com/problems/intersection-of-two-linked-lists/" },
      { title:"Add 1 to a Number Represented by LL", yt:"https://youtu.be/aXQWhbvT3w0", article:"https://takeuforward.org/data-structure/add-1-to-a-number-represented-as-linked-list/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Hard Problems on LL", problems:[
      { title:"Reverse LL in Groups of K", yt:"https://youtu.be/lIar1skcQYI", article:"https://takeuforward.org/data-structure/reverse-linked-list-in-groups-of-size-k/", practice:"https://leetcode.com/problems/reverse-nodes-in-k-group/" },
      { title:"Rotate a Linked List", yt:"https://youtu.be/9VPm6nEbVPA", article:"https://takeuforward.org/data-structure/rotate-a-linked-list/", practice:"https://leetcode.com/problems/rotate-list/" },
      { title:"Flattening a Linked List", yt:"https://youtu.be/ysytSSXpAI0", article:"https://takeuforward.org/data-structure/flattening-a-linked-list/", practice:"https://takeuforward.org/plus" },
      { title:"Clone LL with Random Pointers", yt:"https://youtu.be/VNf6VynfpdM", article:"https://takeuforward.org/data-structure/clone-linked-list-with-random-and-next-pointer/", practice:"https://leetcode.com/problems/copy-list-with-random-pointer/" },
      { title:"Add Two Numbers (LL)", yt:"https://youtu.be/XmRrGzR6udg", article:"https://takeuforward.org/data-structure/add-two-numbers-represented-as-linked-lists/", practice:"https://leetcode.com/problems/add-two-numbers/" },
      { title:"Merge Two Sorted LLs", yt:"https://youtu.be/jXu-H7XuClE", article:"https://takeuforward.org/data-structure/merge-two-sorted-linked-lists/", practice:"https://leetcode.com/problems/merge-two-sorted-lists/" },
      { title:"Merge K Sorted Lists", yt:"https://youtu.be/1zln14-CTMI", article:"https://takeuforward.org/data-structure/merge-k-sorted-lists/", practice:"https://leetcode.com/problems/merge-k-sorted-lists/" },
  ]}
]},
{ step:7, title:"Recursion [PatternWise]", week:4, subtopics:[
  { name:"Get a Strong Hold on Recursion", problems:[
      { title:"Pow(x,n) – Power Function", yt:"https://youtu.be/l0YC3876qxg", article:"https://takeuforward.org/recursion/learn-all-patterns-of-recursion/", practice:"https://leetcode.com/problems/powx-n/" },
      { title:"Count Good Numbers", yt:"https://youtu.be/l0YC3876qxg", article:"https://takeuforward.org/data-structure/count-good-numbers/", practice:"https://leetcode.com/problems/count-good-numbers/" },
      { title:"Sort Stack Using Recursion", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/recursion/sort-a-stack-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Reverse a Stack Using Recursion", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/recursion/reverse-a-stack-using-recursion/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Subsequences Pattern", problems:[
      { title:"Subset Sums – Generate All Subset Sums", yt:"https://youtu.be/eFdBODYNUPY", article:"https://takeuforward.org/data-structure/subset-sum-sum-of-all-subsets/", practice:"https://takeuforward.org/plus" },
      { title:"Subset Sum II – Unique Subsets", yt:"https://youtu.be/RIn3gOkbhQE", article:"https://takeuforward.org/data-structure/subset-ii-print-all-the-unique-subsets/", practice:"https://leetcode.com/problems/subsets-ii/" },
      { title:"Combination Sum I", yt:"https://youtu.be/kvWNHKNv3AQ", article:"https://takeuforward.org/data-structure/combination-sum-1/", practice:"https://leetcode.com/problems/combination-sum/" },
      { title:"Combination Sum II", yt:"https://youtu.be/OyZFFqQtu98", article:"https://takeuforward.org/data-structure/combination-sum-ii-find-all-unique-combinations/", practice:"https://leetcode.com/problems/combination-sum-ii/" },
      { title:"Combination Sum III", yt:"https://youtu.be/f2ic2Rsc9pU", article:"https://takeuforward.org/data-structure/combination-sum-iii/", practice:"https://leetcode.com/problems/combination-sum-iii/" },
      { title:"Letter Combinations of Phone Number", yt:"https://youtu.be/NA2Oj9xqaZQ", article:"https://takeuforward.org/data-structure/letter-combinations-of-a-phone-number/", practice:"https://leetcode.com/problems/letter-combinations-of-a-phone-number/" },
      { title:"Palindrome Partitioning", yt:"https://youtu.be/N_cBL7hT7xM", article:"https://takeuforward.org/data-structure/palindrome-partitioning/", practice:"https://leetcode.com/problems/palindrome-partitioning/" },
      { title:"Word Search", yt:"https://youtu.be/m9TrOL1ETxI", article:"https://takeuforward.org/data-structure/word-search/", practice:"https://leetcode.com/problems/word-search/" },
  ]},
  { name:"Trying out all Combos / Hard", problems:[
      { title:"Permutations I (Extra Array)", yt:"https://youtu.be/YK78FU5Ffjw", article:"https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/", practice:"https://leetcode.com/problems/permutations/" },
      { title:"Permutations II (No Extra Array)", yt:"https://youtu.be/f2ic2Rsc9pU", article:"https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/", practice:"https://leetcode.com/problems/permutations-ii/" },
      { title:"N Queens", yt:"https://youtu.be/i05Ju7AftcM", article:"https://takeuforward.org/data-structure/n-queen-problem-return-all-distinct-solutions-to-the-n-queens-puzzle/", practice:"https://leetcode.com/problems/n-queens/" },
      { title:"Rat in a Maze", yt:"https://youtu.be/bLGZhJlt4y0", article:"https://takeuforward.org/data-structure/rat-in-a-maze/", practice:"https://takeuforward.org/plus" },
      { title:"Sudoku Solver", yt:"https://youtu.be/FWAIf_EVUKE", article:"https://takeuforward.org/data-structure/sudoku-solver/", practice:"https://leetcode.com/problems/sudoku-solver/" },
      { title:"M Coloring Problem", yt:"https://youtu.be/wuVwUK25Rfc", article:"https://takeuforward.org/data-structure/m-coloring-problem/", practice:"https://takeuforward.org/plus" },
      { title:"Expression Add Operators", yt:"https://youtu.be/nV9OkLW-OvI", article:"https://takeuforward.org/data-structure/expression-add-operators/", practice:"https://leetcode.com/problems/expression-add-operators/" },
      { title:"Generate Parentheses", yt:"https://youtu.be/zuRQElJ6CwY", article:"https://takeuforward.org/data-structure/generate-parentheses/", practice:"https://leetcode.com/problems/generate-parentheses/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Subsets", practice:"https://leetcode.com/problems/subsets/" },
      { title:"Subsets II", practice:"https://leetcode.com/problems/subsets-ii/" },
      { title:"Combination Sum", practice:"https://leetcode.com/problems/combination-sum/" },
      { title:"Combination Sum II", practice:"https://leetcode.com/problems/combination-sum-ii/" },
      { title:"Combination Sum III", practice:"https://leetcode.com/problems/combination-sum-iii/" },
      { title:"Permutations", practice:"https://leetcode.com/problems/permutations/" },
      { title:"Permutations II (with duplicates)", practice:"https://leetcode.com/problems/permutations-ii/" },
      { title:"Letter Combinations of a Phone Number", practice:"https://leetcode.com/problems/letter-combinations-of-a-phone-number/" },
      { title:"Palindrome Partitioning", practice:"https://leetcode.com/problems/palindrome-partitioning/" },
      { title:"N-Queens", practice:"https://leetcode.com/problems/n-queens/" },
      { title:"Sudoku Solver", practice:"https://leetcode.com/problems/sudoku-solver/" },
      { title:"Word Search", practice:"https://leetcode.com/problems/word-search/" },
      { title:"Pow(x, n)", practice:"https://leetcode.com/problems/powx-n/" },
      { title:"Count Good Numbers", practice:"https://leetcode.com/problems/count-good-numbers/" },
      { title:"Beautiful Arrangement", practice:"https://leetcode.com/problems/beautiful-arrangement/" },
      { title:"Target Sum (Assign +/- signs)", practice:"https://leetcode.com/problems/target-sum/" },
      { title:"Letter Case Permutation", practice:"https://leetcode.com/problems/letter-case-permutation/" },
      { title:"K-th Symbol in Grammar", practice:"https://leetcode.com/problems/k-th-symbol-in-grammar/" },
  ]}
]},
{ step:8, title:"Bit Manipulation [Concepts & Problems]", week:5, subtopics:[
  { name:"Learn Bit Manipulation", problems:[
      { title:"Introduction to Bit Manipulation", yt:"https://youtu.be/5rtVTYAk9KQ", article:"https://takeuforward.org/data-structure/bit-manipulation-course/", practice:"https://takeuforward.org/plus" },
      { title:"Check if i-th bit is set or not", yt:"https://youtu.be/5rtVTYAk9KQ", article:"https://takeuforward.org/bit-manipulation/check-if-ith-bit-is-set-or-not/", practice:"https://takeuforward.org/plus" },
      { title:"Count Set Bits (Brian Kernighan)", yt:"https://youtu.be/XxtmitBozAA", article:"https://takeuforward.org/bit-manipulation/count-number-of-set-bits/", practice:"https://leetcode.com/problems/number-of-1-bits/" },
      { title:"Check Power of 2", yt:"https://youtu.be/SXrTi7xF30o", article:"https://takeuforward.org/bit-manipulation/check-whether-the-number-is-power-of-2/", practice:"https://leetcode.com/problems/power-of-two/" },
      { title:"Minimum Bit Flips to Convert Number", yt:"https://youtu.be/ZwU6wSkepBI", article:"https://takeuforward.org/bit-manipulation/minimum-bit-flips-to-convert-number/", practice:"https://leetcode.com/problems/minimum-bit-flips-to-convert-number/" },
      { title:"Reverse Bits", yt:"https://youtu.be/QuHxMJV_tcg", article:"https://takeuforward.org/bit-manipulation/reverse-bits/", practice:"https://leetcode.com/problems/reverse-bits/" },
  ]},
  { name:"Interview Problems", problems:[
      { title:"Find the two Non-Repeating Numbers (XOR)", yt:"https://youtu.be/jU07z14VIfs", article:"https://takeuforward.org/bit-manipulation/two-numbers-with-odd-occurrences/", practice:"https://leetcode.com/problems/single-number-iii/" },
      { title:"XOR of Numbers in Range [L, R]", yt:"https://youtu.be/EgI_P01P5-c", article:"https://takeuforward.org/bit-manipulation/xor-of-all-numbers-in-the-range/", practice:"https://takeuforward.org/plus" },
      { title:"Divide Two Integers Without / or *", yt:"https://youtu.be/5hHwnSPiMIs", article:"https://takeuforward.org/bit-manipulation/divide-two-integers-without-using-multiplication-division-and-mod-operator/", practice:"https://leetcode.com/problems/divide-two-integers/" },
      { title:"Single Number III", yt:"https://youtu.be/S5bv3824NE0", article:"https://takeuforward.org/data-structure/single-number-iii/", practice:"https://leetcode.com/problems/single-number-iii/" },
      { title:"Maximum XOR of Two Numbers in Array", yt:"https://youtu.be/BTf05gs_8iU", article:"https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/", practice:"https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
      { title:"All Subsets Using Bit Masking", yt:"https://youtu.be/tnSi6synbgM", article:"https://takeuforward.org/bit-manipulation/all-subsets-using-bit-masking/", practice:"https://leetcode.com/problems/subsets/" },
      { title:"Count Total Set Bits 1 to N", yt:"https://youtu.be/g_hIx4yn_zg", article:"https://takeuforward.org/bit-manipulation/count-total-set-bits/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Single Number", practice:"https://leetcode.com/problems/single-number/" },
      { title:"Single Number II", practice:"https://leetcode.com/problems/single-number-ii/" },
      { title:"Single Number III", practice:"https://leetcode.com/problems/single-number-iii/" },
      { title:"Counting Bits", practice:"https://leetcode.com/problems/counting-bits/" },
      { title:"Number of 1 Bits (Hamming Weight)", practice:"https://leetcode.com/problems/number-of-1-bits/" },
      { title:"Missing Number (XOR approach)", practice:"https://leetcode.com/problems/missing-number/" },
      { title:"Sum of Two Integers (Bit Manipulation)", practice:"https://leetcode.com/problems/sum-of-two-integers/" },
      { title:"Bitwise AND of Numbers Range", practice:"https://leetcode.com/problems/bitwise-and-of-numbers-range/" },
      { title:"Total Hamming Distance", practice:"https://leetcode.com/problems/total-hamming-distance/" },
      { title:"XOR Queries of a Subarray", practice:"https://leetcode.com/problems/xor-queries-of-a-subarray/" },
      { title:"Decode XORed Array", practice:"https://leetcode.com/problems/decode-xored-array/" },
      { title:"Power of Four", practice:"https://leetcode.com/problems/power-of-four/" },
      { title:"Subsets (Bitmask approach)", practice:"https://leetcode.com/problems/subsets/" },
      { title:"Reverse Bits", practice:"https://leetcode.com/problems/reverse-bits/" },
      { title:"Maximum XOR of Two Numbers in Array", practice:"https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
      { title:"Find XOR Beauty of Array", practice:"https://leetcode.com/problems/find-xor-beauty-of-array/" },
      { title:"Minimum Bit Flips to Convert Number", practice:"https://leetcode.com/problems/minimum-bit-flips-to-convert-number/" },
  ]}
]},
{ step:9, title:"Stack and Queues [Learning, Pre-In-Post-fix, Monotonic]", week:5, subtopics:[
  { name:"Learning", problems:[
      { title:"Stack using Array", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/data-structure/implement-stack-using-array/", practice:"https://leetcode.com/problems/min-stack/" },
      { title:"Stack using Linked List", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/data-structure/implement-stack-using-linked-list/", practice:"https://takeuforward.org/plus" },
      { title:"Queue using Array", yt:"https://youtu.be/REOH22Xwdkk", article:"https://takeuforward.org/data-structure/implement-queue-using-array/", practice:"https://leetcode.com/problems/design-circular-queue/" },
      { title:"Queue using Stack", yt:"https://youtu.be/3Et9MrMc02A", article:"https://takeuforward.org/data-structure/queue-using-stack/", practice:"https://leetcode.com/problems/implement-queue-using-stacks/" },
      { title:"Stack using Queue", yt:"https://youtu.be/jDZQKzEtbYQ", article:"https://takeuforward.org/data-structure/stack-using-queue/", practice:"https://leetcode.com/problems/implement-stack-using-queues/" },
      { title:"Valid Parentheses", yt:"https://youtu.be/HVJ3DHTPhuI", article:"https://takeuforward.org/data-structure/valid-parentheses/", practice:"https://leetcode.com/problems/valid-parentheses/" },
      { title:"Min Stack", yt:"https://youtu.be/133LfwxPaHE", article:"https://takeuforward.org/data-structure/implement-a-min-stack/", practice:"https://leetcode.com/problems/min-stack/" },
  ]},
  { name:"Prefix, Infix, Postfix Conversions", problems:[
      { title:"Infix to Postfix Conversion", yt:"https://youtu.be/aN0VB5eRLno", article:"https://takeuforward.org/data-structure/infix-to-postfix-conversion/", practice:"https://takeuforward.org/plus" },
      { title:"Prefix to Infix Conversion", yt:"https://youtu.be/dplYC2F7OJA", article:"https://takeuforward.org/data-structure/prefix-to-infix-conversion/", practice:"https://takeuforward.org/plus" },
      { title:"Postfix Evaluation", yt:"https://youtu.be/IFOSCqbxL6E", article:"https://takeuforward.org/data-structure/postfix-evaluation/", practice:"https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
  ]},
  { name:"Monotonic Stack / Queue", problems:[
      { title:"Next Greater Element I", yt:"https://youtu.be/Dq_ObZwTY_Q", article:"https://takeuforward.org/data-structure/next-greater-element/", practice:"https://leetcode.com/problems/next-greater-element-i/" },
      { title:"Next Greater Element II (Circular)", yt:"https://youtu.be/Du881K7Jtk8", article:"https://takeuforward.org/data-structure/next-greater-element-using-stack/", practice:"https://leetcode.com/problems/next-greater-element-ii/" },
      { title:"Next Smaller Element", yt:"https://youtu.be/eXyniy96SiU", article:"https://takeuforward.org/data-structure/next-smaller-element/", practice:"https://takeuforward.org/plus" },
      { title:"Trapping Rain Water", yt:"https://youtu.be/m18Hntz4go8", article:"https://takeuforward.org/data-structure/trapping-rainwater/", practice:"https://leetcode.com/problems/trapping-rain-water/" },
      { title:"Largest Rectangle in Histogram", yt:"https://youtu.be/X0X7ne0gjOg", article:"https://takeuforward.org/data-structure/area-of-largest-rectangle-in-histogram/", practice:"https://leetcode.com/problems/largest-rectangle-in-histogram/" },
      { title:"Sum of Subarray Minimums", yt:"https://youtu.be/pNSXMuffpmQ", article:"https://takeuforward.org/data-structure/sum-of-subarray-minimums/", practice:"https://leetcode.com/problems/sum-of-subarray-minimums/" },
      { title:"Sum of Subarray Ranges", yt:"https://youtu.be/jC_cWLy7jSI", article:"https://takeuforward.org/data-structure/sum-of-subarray-ranges/", practice:"https://leetcode.com/problems/sum-of-subarray-ranges/" },
      { title:"Asteroid Collision", yt:"https://youtu.be/LN7KjRszjk4", article:"https://takeuforward.org/data-structure/asteroid-collision/", practice:"https://leetcode.com/problems/asteroid-collision/" },
      { title:"Remove K Digits", yt:"https://youtu.be/cFabMOnJaq0", article:"https://takeuforward.org/data-structure/remove-k-digits/", practice:"https://leetcode.com/problems/remove-k-digits/" },
      { title:"Maximal Rectangle in Matrix", yt:"https://youtu.be/tOylVCugy9k", article:"https://takeuforward.org/data-structure/maximal-rectangle-area/", practice:"https://leetcode.com/problems/maximal-rectangle/" },
      { title:"Sliding Window Maximum (Deque)", yt:"https://youtu.be/CZB6yhLoyQk", article:"https://takeuforward.org/data-structure/sliding-window-maximum/", practice:"https://leetcode.com/problems/sliding-window-maximum/" },
  ]}
]},
{ step:10, title:"Sliding Window & Two Pointer Combined Problems", week:6, subtopics:[
  { name:"Medium Problems", problems:[
      { title:"Longest Subarray with Sum K (Positives)", yt:"https://youtu.be/SI_bV2t_0v4", article:"https://takeuforward.org/data-structure/longest-subarray-with-sum-k/", practice:"https://takeuforward.org/plus" },
      { title:"Longest Subarray with K 1s", yt:"https://youtu.be/fFe1uJX1uQg", article:"https://takeuforward.org/data-structure/longest-subarray-with-sum-k-for-arrays-with-positives-and-zeroes/", practice:"https://leetcode.com/problems/max-consecutive-ones-iii/" },
      { title:"Count Subarrays with K sum", yt:"https://youtu.be/hyhnZkbcJuE", article:"https://takeuforward.org/data-structure/count-subarray-sum-equals-k/", practice:"https://leetcode.com/problems/subarray-sum-equals-k/" },
      { title:"Longest Substring with K Unique Characters", yt:"https://youtu.be/KiFLRc6l2gM", article:"https://takeuforward.org/data-structure/longest-substring-with-k-unique-characters/", practice:"https://takeuforward.org/plus" },
      { title:"Longest Substring Without Repeating Characters", yt:"https://youtu.be/qtVh-XEpsJo", article:"https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/", practice:"https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
      { title:"Max Consecutive Ones III", yt:"https://youtu.be/3E4JBHSLpYk", article:"https://takeuforward.org/data-structure/maximum-consecutive-ones/", practice:"https://leetcode.com/problems/max-consecutive-ones-iii/" },
      { title:"Fruits into Baskets", yt:"https://youtu.be/e3bs0uA1NhQ", article:"https://takeuforward.org/data-structure/fruit-into-baskets/", practice:"https://leetcode.com/problems/fruit-into-baskets/" },
      { title:"Binary Subarrays with Sum", yt:"https://youtu.be/9LcMGLKo6V0", article:"https://takeuforward.org/data-structure/binary-subarrays-with-sum/", practice:"https://leetcode.com/problems/binary-subarrays-with-sum/" },
      { title:"Count Nice Subarrays (Odd Numbers)", yt:"https://youtu.be/UqlI4CuTZ9g", article:"https://takeuforward.org/data-structure/count-number-of-nice-subarrays/", practice:"https://leetcode.com/problems/count-number-of-nice-subarrays/" },
      { title:"Substrings with All Three Characters", yt:"https://youtu.be/-zSGNjkt8qI", article:"https://takeuforward.org/data-structure/number-of-substrings-containing-all-three-characters/", practice:"https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/" },
      { title:"Maximum Points from Cards", yt:"https://youtu.be/A3UtekJgi5s", article:"https://takeuforward.org/data-structure/maximum-points-you-can-obtain-from-cards/", practice:"https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/" },
  ]},
  { name:"Hard Problems", problems:[
      { title:"Minimum Size Subarray Sum", yt:"https://youtu.be/Xg8ykJFKPQE", article:"https://takeuforward.org/data-structure/minimum-size-subarray-sum/", practice:"https://leetcode.com/problems/minimum-size-subarray-sum/" },
      { title:"Minimum Window Substring", yt:"https://youtu.be/WJaij9ffOIY", article:"https://takeuforward.org/data-structure/minimum-window-substring/", practice:"https://leetcode.com/problems/minimum-window-substring/" },
      { title:"Permutation in String", yt:"https://youtu.be/UbyhOgBN834", article:"https://takeuforward.org/data-structure/permutation-in-string/", practice:"https://leetcode.com/problems/permutation-in-string/" },
      { title:"Longest Repeating Character Replacement", yt:"https://youtu.be/_eNhaDkMXEA", article:"https://takeuforward.org/data-structure/longest-repeating-character-replacement/", practice:"https://leetcode.com/problems/longest-repeating-character-replacement/" },
      { title:"Number of Substrings with All 1s", yt:"https://youtu.be/1aFV0sUNHMc", article:"https://takeuforward.org/data-structure/count-substrings-with-all-1s/", practice:"https://leetcode.com/problems/count-substrings-with-only-one-distinct-letter/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Longest Substring Without Repeating Characters", practice:"https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
      { title:"Minimum Window Substring", practice:"https://leetcode.com/problems/minimum-window-substring/" },
      { title:"Sliding Window Maximum", practice:"https://leetcode.com/problems/sliding-window-maximum/" },
      { title:"Permutation in String", practice:"https://leetcode.com/problems/permutation-in-string/" },
      { title:"Longest Repeating Character Replacement", practice:"https://leetcode.com/problems/longest-repeating-character-replacement/" },
      { title:"Fruits into Baskets", practice:"https://leetcode.com/problems/fruit-into-baskets/" },
      { title:"Max Consecutive Ones III", practice:"https://leetcode.com/problems/max-consecutive-ones-iii/" },
      { title:"Subarray Sum Equals K", practice:"https://leetcode.com/problems/subarray-sum-equals-k/" },
      { title:"Minimum Size Subarray Sum", practice:"https://leetcode.com/problems/minimum-size-subarray-sum/" },
      { title:"Longest Turbulent Subarray", practice:"https://leetcode.com/problems/longest-turbulent-subarray/" },
      { title:"Frequency of Most Frequent Element", practice:"https://leetcode.com/problems/frequency-of-the-most-frequent-element/" },
      { title:"Get Equal Substrings Within Budget", practice:"https://leetcode.com/problems/get-equal-substrings-within-budget/" },
      { title:"Grumpy Bookstore Owner", practice:"https://leetcode.com/problems/grumpy-bookstore-owner/" },
      { title:"Substring with Concatenation of All Words", practice:"https://leetcode.com/problems/substring-with-concatenation-of-all-words/" },
      { title:"Maximum Points You Can Obtain from Cards", practice:"https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/" },
  ]}
]},
{ step:11, title:"Heaps [Learning, Medium Problems, Hard Problems]", week:6, subtopics:[
  { name:"Learning", problems:[
      { title:"Introduction to Heap (Min/Max Heap)", yt:"https://youtu.be/HqPJF2L5h9U", article:"https://takeuforward.org/heap/introduction-to-heap/", practice:"https://takeuforward.org/plus" },
      { title:"Heapify Algorithm and Heap Sort", yt:"https://youtu.be/3myiX37g2No", article:"https://takeuforward.org/heap/heapify-and-heap-sort/", practice:"https://leetcode.com/problems/sort-an-array/" },
      { title:"Check if Binary Tree is a Heap", yt:"https://youtu.be/i41AqPYdFBU", article:"https://takeuforward.org/heap/check-if-bt-is-heap/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Medium Problems", problems:[
      { title:"Kth Largest Element in Array", yt:"https://youtu.be/ywWBy6J5gz8", article:"https://takeuforward.org/data-structure/kth-largest-element-in-an-array/", practice:"https://leetcode.com/problems/kth-largest-element-in-an-array/" },
      { title:"Kth Smallest Element in Array", yt:"https://youtu.be/9XALmcSKDrc", article:"https://takeuforward.org/data-structure/kth-smallest-element-in-an-array/", practice:"https://takeuforward.org/plus" },
      { title:"Sort a K-Sorted Array", yt:"https://youtu.be/lZB5AySnVxk", article:"https://takeuforward.org/heap/sort-k-sorted-array/", practice:"https://takeuforward.org/plus" },
      { title:"Top K Frequent Elements", yt:"https://youtu.be/vgrQPMCGSOg", article:"https://takeuforward.org/data-structure/top-k-frequent-elements/", practice:"https://leetcode.com/problems/top-k-frequent-elements/" },
      { title:"Task Scheduler", yt:"https://youtu.be/ySTQCRya6B0", article:"https://takeuforward.org/data-structure/task-scheduler/", practice:"https://leetcode.com/problems/task-scheduler/" },
      { title:"Hands of Straights", yt:"https://youtu.be/amnrMX4NyiE", article:"https://takeuforward.org/greedy/hand-of-straights/", practice:"https://leetcode.com/problems/hand-of-straights/" },
      { title:"K Most Frequent Words", yt:"https://youtu.be/WwfnCDtRRjk", article:"https://takeuforward.org/heap/k-most-frequent-words/", practice:"https://leetcode.com/problems/top-k-frequent-words/" },
  ]},
  { name:"Hard Problems", problems:[
      { title:"Merge K Sorted Lists", yt:"https://youtu.be/kpCesr9VXDA", article:"https://takeuforward.org/heap/merge-k-sorted-lists/", practice:"https://leetcode.com/problems/merge-k-sorted-lists/" },
      { title:"Replace Elements by Rank", yt:"https://youtu.be/Xd_5FiQQGiI", article:"https://takeuforward.org/heap/replace-elements-by-rank/", practice:"https://takeuforward.org/plus" },
      { title:"Find Median from Data Stream", yt:"https://youtu.be/itmhHWaHupI", article:"https://takeuforward.org/data-structure/find-median-from-data-stream/", practice:"https://leetcode.com/problems/find-median-from-data-stream/" },
      { title:"K Closest Points to Origin", yt:"https://youtu.be/rI2EBUEMfTk", article:"https://takeuforward.org/heap/k-closest-points-to-origin/", practice:"https://leetcode.com/problems/k-closest-points-to-origin/" },
      { title:"Maximum Sum Combination", yt:"https://youtu.be/gCJovpFpEgg", article:"https://takeuforward.org/heap/maximum-sum-combinations/", practice:"https://www.interviewbit.com/problems/maximum-sum-combinations/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Kth Largest Element in an Array", practice:"https://leetcode.com/problems/kth-largest-element-in-an-array/" },
      { title:"Top K Frequent Elements", practice:"https://leetcode.com/problems/top-k-frequent-elements/" },
      { title:"Task Scheduler", practice:"https://leetcode.com/problems/task-scheduler/" },
      { title:"Merge K Sorted Lists", practice:"https://leetcode.com/problems/merge-k-sorted-lists/" },
      { title:"Find Median from Data Stream", practice:"https://leetcode.com/problems/find-median-from-data-stream/" },
      { title:"K Closest Points to Origin", practice:"https://leetcode.com/problems/k-closest-points-to-origin/" },
      { title:"Reorganize String", practice:"https://leetcode.com/problems/reorganize-string/" },
      { title:"Last Stone Weight", practice:"https://leetcode.com/problems/last-stone-weight/" },
      { title:"Kth Largest Element in a Stream", practice:"https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
      { title:"Ugly Number II", practice:"https://leetcode.com/problems/ugly-number-ii/" },
      { title:"Find K Pairs with Smallest Sums", practice:"https://leetcode.com/problems/find-k-pairs-with-smallest-sums/" },
      { title:"Kth Smallest Element in a Sorted Matrix", practice:"https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" },
      { title:"Top K Frequent Words", practice:"https://leetcode.com/problems/top-k-frequent-words/" },
      { title:"Smallest Range Covering Elements from K Lists", practice:"https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/" },
      { title:"Sort an Array (Heap Sort)", practice:"https://leetcode.com/problems/sort-an-array/" },
  ]}
]},
{ step:12, title:"Greedy Algorithms [Easy, Medium/Hard]", week:7, subtopics:[
  { name:"Easy Problems", problems:[
      { title:"Assign Cookies", yt:"https://youtu.be/DIX2p7vb9co", article:"https://takeuforward.org/greedy/assign-cookies/", practice:"https://leetcode.com/problems/assign-cookies/" },
      { title:"Fractional Knapsack", yt:"https://youtu.be/F_DDzYnxO14", article:"https://takeuforward.org/data-structure/fractional-knapsack-problem-greedy-approach/", practice:"https://takeuforward.org/plus" },
      { title:"Greedy Job Sequencing", yt:"https://youtu.be/LjPx4wQaRIs", article:"https://takeuforward.org/data-structure/job-sequencing-problem/", practice:"https://takeuforward.org/plus" },
      { title:"N Meetings in One Room", yt:"https://youtu.be/mKfhTotEguk", article:"https://takeuforward.org/data-structure/n-meetings-in-one-room/", practice:"https://takeuforward.org/plus" },
      { title:"Minimum Platforms Required for Railway", yt:"https://youtu.be/AsGzwR_FWok", article:"https://takeuforward.org/data-structure/minimum-number-of-platforms-required-for-a-railway/", practice:"https://takeuforward.org/plus" },
      { title:"Minimum Coins", yt:"https://youtu.be/mVg9CfJvayM", article:"https://takeuforward.org/data-structure/find-minimum-number-of-coins/", practice:"https://leetcode.com/problems/coin-change/" },
  ]},
  { name:"Medium / Hard Problems", problems:[
      { title:"Jump Game I", yt:"https://youtu.be/tZAa_jJ3SwQ", article:"https://takeuforward.org/data-structure/jump-game-greedy-approach/", practice:"https://leetcode.com/problems/jump-game/" },
      { title:"Jump Game II", yt:"https://youtu.be/7SedJZqajCU", article:"https://takeuforward.org/data-structure/jump-game-2-greedy-approach/", practice:"https://leetcode.com/problems/jump-game-ii/" },
      { title:"Candy Distribution", yt:"https://youtu.be/IIqVFvKE6RY", article:"https://takeuforward.org/data-structure/candy-leetcode-greedy-approach/", practice:"https://leetcode.com/problems/candy/" },
      { title:"Insert Intervals", yt:"https://youtu.be/xxRE-46OCC8", article:"https://takeuforward.org/data-structure/insert-interval/", practice:"https://leetcode.com/problems/insert-interval/" },
      { title:"Merge Intervals", yt:"https://youtu.be/IexN60k62jo", article:"https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/", practice:"https://leetcode.com/problems/merge-intervals/" },
      { title:"Non-overlapping Intervals", yt:"https://youtu.be/nONCGxWoUfM", article:"https://takeuforward.org/data-structure/non-overlapping-intervals/", practice:"https://leetcode.com/problems/non-overlapping-intervals/" },
      { title:"Valid Parenthesis String", yt:"https://youtu.be/cHT6sG_hUZI", article:"https://takeuforward.org/data-structure/valid-parenthesis-string/", practice:"https://leetcode.com/problems/valid-parenthesis-string/" },
      { title:"Shortest Job First (SJF) Scheduling", yt:"https://youtu.be/VyWp3BIHKY8", article:"https://takeuforward.org/operating-systems/shortest-job-first/", practice:"https://takeuforward.org/plus" },
      { title:"Gas Station", yt:"https://youtu.be/nTKdYm_5-ZY", article:"https://takeuforward.org/greedy/gas-station/", practice:"https://leetcode.com/problems/gas-station/" },
      { title:"Largest Number", yt:"https://youtu.be/ffBCBqBRgj0", article:"https://takeuforward.org/greedy/largest-number/", practice:"https://leetcode.com/problems/largest-number/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Assign Cookies", practice:"https://leetcode.com/problems/assign-cookies/" },
      { title:"Jump Game", practice:"https://leetcode.com/problems/jump-game/" },
      { title:"Jump Game II", practice:"https://leetcode.com/problems/jump-game-ii/" },
      { title:"Candy", practice:"https://leetcode.com/problems/candy/" },
      { title:"Gas Station", practice:"https://leetcode.com/problems/gas-station/" },
      { title:"Merge Intervals", practice:"https://leetcode.com/problems/merge-intervals/" },
      { title:"Insert Interval", practice:"https://leetcode.com/problems/insert-interval/" },
      { title:"Non-overlapping Intervals", practice:"https://leetcode.com/problems/non-overlapping-intervals/" },
      { title:"Valid Parenthesis String", practice:"https://leetcode.com/problems/valid-parenthesis-string/" },
      { title:"Minimum Number of Arrows to Burst Balloons", practice:"https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/" },
      { title:"Lemonade Change", practice:"https://leetcode.com/problems/lemonade-change/" },
      { title:"Two City Scheduling", practice:"https://leetcode.com/problems/two-city-scheduling/" },
      { title:"Queue Reconstruction by Height", practice:"https://leetcode.com/problems/queue-reconstruction-by-height/" },
      { title:"Boats to Save People", practice:"https://leetcode.com/problems/boats-to-save-people/" },
      { title:"Can Place Flowers", practice:"https://leetcode.com/problems/can-place-flowers/" },
      { title:"Largest Number (Custom Comparator)", practice:"https://leetcode.com/problems/largest-number/" },
      { title:"Remove Covered Intervals", practice:"https://leetcode.com/problems/remove-covered-intervals/" },
      { title:"Advantage Shuffle", practice:"https://leetcode.com/problems/advantage-shuffle/" },
  ]}
]},
{ step:13, title:"Binary Trees [Traversals, Medium, Hard Problems]", week:7, subtopics:[
  { name:"Traversals", problems:[
      { title:"Introduction to Binary Trees", yt:"https://youtu.be/hyynSAFRFaI", article:"https://takeuforward.org/data-structure/introduction-to-binary-trees/", practice:"https://takeuforward.org/plus" },
      { title:"Preorder, Inorder, Postorder (Recursive)", yt:"https://youtu.be/RlUu72JrOUM", article:"https://takeuforward.org/data-structure/preorder-inorder-postorder-traversals-in-one-traversal/", practice:"https://leetcode.com/problems/binary-tree-inorder-traversal/" },
      { title:"Iterative Inorder Traversal", yt:"https://youtu.be/lxTGsVXjwvM", article:"https://takeuforward.org/data-structure/inorder-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-inorder-traversal/" },
      { title:"Iterative Preorder Traversal", yt:"https://youtu.be/80Zug6D1_r4", article:"https://takeuforward.org/data-structure/preorder-traversal-of-binary-tree-using-iterative-approach/", practice:"https://leetcode.com/problems/binary-tree-preorder-traversal/" },
      { title:"Iterative Postorder (2 Stacks)", yt:"https://youtu.be/fCmKqRfuMb8", article:"https://takeuforward.org/data-structure/post-order-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-postorder-traversal/" },
      { title:"Iterative Postorder (1 Stack)", yt:"https://youtu.be/kC6p-t2DEos", article:"https://takeuforward.org/data-structure/binary-tree-post-order-traversal-using-1-stack/", practice:"https://leetcode.com/problems/binary-tree-postorder-traversal/" },
      { title:"Level Order Traversal (BFS)", yt:"https://youtu.be/EoAsWbO7sqg", article:"https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-level-order-traversal/" },
      { title:"Morris Inorder Traversal (O(1) space)", yt:"https://youtu.be/80Zug6D1_r4", article:"https://takeuforward.org/data-structure/morris-inorder-traversal/", practice:"https://leetcode.com/problems/binary-tree-inorder-traversal/" },
      { title:"Morris Preorder Traversal", yt:"https://youtu.be/80Zug6D1_r4", article:"https://takeuforward.org/data-structure/morris-preorder-traversal/", practice:"https://leetcode.com/problems/binary-tree-preorder-traversal/" },
  ]},
  { name:"Medium Problems", problems:[
      { title:"Height of Binary Tree", yt:"https://youtu.be/eD95WRfh81c", article:"https://takeuforward.org/data-structure/find-the-height-depth-of-a-binary-tree/", practice:"https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
      { title:"Check Balanced Binary Tree", yt:"https://youtu.be/Yt50Jfbd8Po", article:"https://takeuforward.org/data-structure/check-whether-the-binary-tree-is-balanced-or-not/", practice:"https://leetcode.com/problems/balanced-binary-tree/" },
      { title:"Diameter of Binary Tree", yt:"https://youtu.be/Rezetez59Nk", article:"https://takeuforward.org/data-structure/calculate-the-diameter-of-a-binary-tree/", practice:"https://leetcode.com/problems/diameter-of-binary-tree/" },
      { title:"Maximum Path Sum in BT", yt:"https://youtu.be/WszrfSwMz58", article:"https://takeuforward.org/data-structure/maximum-sum-path-in-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
      { title:"Same Tree / Identical Trees", yt:"https://youtu.be/BhuvF_-PWS0", article:"https://takeuforward.org/data-structure/check-if-two-trees-are-identical-or-not/", practice:"https://leetcode.com/problems/same-tree/" },
      { title:"Zigzag Level Order Traversal", yt:"https://youtu.be/_AwsRyg3a5M", article:"https://takeuforward.org/data-structure/zigzag-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
      { title:"Boundary Traversal", yt:"https://youtu.be/0ca1nvR0be4", article:"https://takeuforward.org/data-structure/boundary-traversal-of-binary-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Vertical Order Traversal", yt:"https://youtu.be/q_a6lpbKJdw", article:"https://takeuforward.org/data-structure/vertical-order-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/" },
      { title:"Top View of Binary Tree", yt:"https://youtu.be/Et9OCDNvJ78", article:"https://takeuforward.org/data-structure/top-view-of-a-binary-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Bottom View of Binary Tree", yt:"https://youtu.be/0FtVY6I4pB8", article:"https://takeuforward.org/data-structure/bottom-view-of-a-binary-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Right View / Left View", yt:"https://youtu.be/KV4mRzTjlAk", article:"https://takeuforward.org/data-structure/right-left-view-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-right-side-view/" },
      { title:"Symmetric Binary Tree", yt:"https://youtu.be/nKggNAiEpBE", article:"https://takeuforward.org/data-structure/check-for-symmetrical-binary-tree/", practice:"https://leetcode.com/problems/symmetric-tree/" },
      { title:"Root to Node Path", yt:"https://youtu.be/fmflMqVOC7k", article:"https://takeuforward.org/data-structure/print-root-to-node-path-in-a-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-paths/" },
      { title:"LCA of Binary Tree", yt:"https://youtu.be/0r3cEKZiLmg", article:"https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/", practice:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
  ]},
  { name:"Hard Problems", problems:[
      { title:"Maximum Width of Binary Tree", yt:"https://youtu.be/ZbybYvcVLks", article:"https://takeuforward.org/data-structure/maximum-width-of-binary-tree/", practice:"https://leetcode.com/problems/maximum-width-of-binary-tree/" },
      { title:"Children Sum Property", yt:"https://youtu.be/fnmisPM6cVo", article:"https://takeuforward.org/data-structure/check-for-children-sum-property-in-a-binary-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Minimum Time to Burn Binary Tree", yt:"https://youtu.be/2r5wLmQfD6g", article:"https://takeuforward.org/data-structure/minimum-time-taken-to-burn-the-binary-tree-from-a-node/", practice:"https://takeuforward.org/plus" },
      { title:"Count Nodes in Complete Binary Tree", yt:"https://youtu.be/u-yWemKGWO0", article:"https://takeuforward.org/data-structure/count-nodes-in-a-complete-binary-tree/", practice:"https://leetcode.com/problems/count-complete-tree-nodes/" },
      { title:"Requirements to Construct Unique BT", yt:"https://youtu.be/5s0ojfWCm_E", article:"https://takeuforward.org/data-structure/requirement-for-unique-binary-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Construct BT from Preorder & Inorder", yt:"https://youtu.be/aZNaLrVebKQ", article:"https://takeuforward.org/data-structure/construct-a-binary-tree-from-inorder-and-preorder-traversal/", practice:"https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
      { title:"Construct BT from Postorder & Inorder", yt:"https://youtu.be/LgLRTaEMRVc", article:"https://takeuforward.org/data-structure/construct-a-binary-tree-from-inorder-and-postorder-traversal/", practice:"https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/" },
      { title:"Flatten Binary Tree to Linked List", yt:"https://youtu.be/sWf7k1x9XR4", article:"https://takeuforward.org/data-structure/flatten-binary-tree-to-linked-list/", practice:"https://leetcode.com/problems/flatten-binary-tree-to-linked-list/" },
      { title:"Serialize and Deserialize Binary Tree", yt:"https://youtu.be/-YbXySKJsX8", article:"https://takeuforward.org/data-structure/serialize-and-deserialize-binary-tree/", practice:"https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
  ]}
]},
{ step:14, title:"Binary Search Trees [Concept & Problems]", week:7, subtopics:[
  { name:"Concepts", problems:[
      { title:"Introduction to BST", yt:"https://youtu.be/p7-9UvDQZ3w", article:"https://takeuforward.org/data-structure/introduction-to-binary-search-tree/", practice:"https://leetcode.com/problems/search-in-a-binary-search-tree/" },
      { title:"Search in BST", yt:"https://youtu.be/KcNt6v_56cc", article:"https://takeuforward.org/data-structure/search-in-a-binary-search-tree/", practice:"https://leetcode.com/problems/search-in-a-binary-search-tree/" },
      { title:"Floor in BST", yt:"https://youtu.be/xm_W1ub-K-w", article:"https://takeuforward.org/data-structure/floor-in-a-binary-search-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Ceil in BST", yt:"https://youtu.be/xm_W1ub-K-w", article:"https://takeuforward.org/data-structure/ceil-in-a-binary-search-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Insert a Node in BST", yt:"https://youtu.be/FiFiNvM29ps", article:"https://takeuforward.org/data-structure/insert-a-node-in-binary-search-tree/", practice:"https://leetcode.com/problems/insert-into-a-binary-search-tree/" },
      { title:"Delete a Node in BST", yt:"https://youtu.be/kouxiP_H5WE", article:"https://takeuforward.org/data-structure/delete-a-node-in-binary-search-tree/", practice:"https://leetcode.com/problems/delete-node-in-a-bst/" },
  ]},
  { name:"Problems on BST", problems:[
      { title:"Kth Smallest / Largest Element in BST", yt:"https://youtu.be/9TJYWh0adfk", article:"https://takeuforward.org/data-structure/kth-largest-smallest-element-in-binary-search-tree/", practice:"https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
      { title:"LCA of Binary Search Tree", yt:"https://youtu.be/cX_kFSSIYf8", article:"https://takeuforward.org/data-structure/lowest-common-ancestor-in-a-binary-search-tree/", practice:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
      { title:"Construct BST from Preorder Traversal", yt:"https://youtu.be/UmJT3j26t1I", article:"https://takeuforward.org/data-structure/construct-a-bst-from-a-preorder-traversal/", practice:"https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/" },
      { title:"Inorder Successor / Predecessor in BST", yt:"https://youtu.be/SXKAD2svfmI", article:"https://takeuforward.org/data-structure/find-inorder-successor-predecessor-of-a-node-in-bst/", practice:"https://leetcode.com/problems/inorder-successor-in-bst/" },
      { title:"BST Iterator", yt:"https://youtu.be/D2jMcmxU4bs", article:"https://takeuforward.org/data-structure/binary-search-tree-iterator/", practice:"https://leetcode.com/problems/binary-search-tree-iterator/" },
      { title:"Two Sum in BST", yt:"https://youtu.be/ssL3sHwPeb4", article:"https://takeuforward.org/data-structure/two-sum-in-bst/", practice:"https://leetcode.com/problems/two-sum-iv-input-is-a-bst/" },
      { title:"Recover BST (Fix Two Swapped Nodes)", yt:"https://youtu.be/ZWGW7FminDM", article:"https://takeuforward.org/data-structure/recover-bst-correct-bst-with-two-nodes-swapped/", practice:"https://leetcode.com/problems/recover-binary-search-tree/" },
      { title:"Largest BST in a Binary Tree", yt:"https://youtu.be/X0oXMdtUDwo", article:"https://takeuforward.org/data-structure/largest-bst-in-binary-tree/", practice:"https://takeuforward.org/plus" },
      { title:"Validate Binary Search Tree", yt:"https://youtu.be/f-sj7I5oXEI", article:"https://takeuforward.org/data-structure/validate-binary-search-tree/", practice:"https://leetcode.com/problems/validate-binary-search-tree/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Search in a Binary Search Tree", practice:"https://leetcode.com/problems/search-in-a-binary-search-tree/" },
      { title:"Insert into a Binary Search Tree", practice:"https://leetcode.com/problems/insert-into-a-binary-search-tree/" },
      { title:"Delete Node in a BST", practice:"https://leetcode.com/problems/delete-node-in-a-bst/" },
      { title:"Validate Binary Search Tree", practice:"https://leetcode.com/problems/validate-binary-search-tree/" },
      { title:"Kth Smallest Element in a BST", practice:"https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
      { title:"Lowest Common Ancestor of BST", practice:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
      { title:"Range Sum of BST", practice:"https://leetcode.com/problems/range-sum-of-bst/" },
      { title:"Construct BST from Preorder Traversal", practice:"https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/" },
      { title:"BST Iterator", practice:"https://leetcode.com/problems/binary-search-tree-iterator/" },
      { title:"Two Sum IV – Input is a BST", practice:"https://leetcode.com/problems/two-sum-iv-input-is-a-bst/" },
      { title:"Recover Binary Search Tree", practice:"https://leetcode.com/problems/recover-binary-search-tree/" },
      { title:"Convert Sorted Array to BST", practice:"https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/" },
      { title:"Trim a Binary Search Tree", practice:"https://leetcode.com/problems/trim-a-binary-search-tree/" },
      { title:"Minimum Absolute Difference in BST", practice:"https://leetcode.com/problems/minimum-absolute-difference-in-bst/" },
      { title:"Convert BST to Greater Tree", practice:"https://leetcode.com/problems/convert-bst-to-greater-tree/" },
      { title:"Find Mode in Binary Search Tree", practice:"https://leetcode.com/problems/find-mode-in-binary-search-tree/" },
      { title:"Unique Binary Search Trees", practice:"https://leetcode.com/problems/unique-binary-search-trees/" },
      { title:"Balance a Binary Search Tree", practice:"https://leetcode.com/problems/balance-a-binary-search-tree/" },
  ]}
]},
{ step:15, title:"Graphs [BFS, DFS, Topo, Shortest Path, MST, DSU]", week:8, subtopics:[
  { name:"Learning – BFS/DFS", problems:[
      { title:"Graph Representation (Adjacency Matrix/List)", yt:"https://youtu.be/M3_pLsDdeuU", article:"https://takeuforward.org/graph/introduction-to-graph/", practice:"https://takeuforward.org/plus" },
      { title:"BFS Traversal", yt:"https://youtu.be/iu1umy77DvI", article:"https://takeuforward.org/graph/breadth-first-search-bfs-level-order-traversal/", practice:"https://leetcode.com/problems/number-of-islands/" },
      { title:"DFS Traversal", yt:"https://youtu.be/Qzf1a--rhp8", article:"https://takeuforward.org/graph/dfs-traversal-of-graph/", practice:"https://leetcode.com/problems/number-of-islands/" },
      { title:"Number of Provinces", yt:"https://youtu.be/ACzkVtewUYA", article:"https://takeuforward.org/graph/number-of-provinces/", practice:"https://leetcode.com/problems/number-of-provinces/" },
      { title:"Number of Islands", yt:"https://youtu.be/muncqlKJrH0", article:"https://takeuforward.org/graph/number-of-islands/", practice:"https://leetcode.com/problems/number-of-islands/" },
      { title:"Flood Fill", yt:"https://youtu.be/C-2_uSRli8o", article:"https://takeuforward.org/graph/flood-fill-algorithm/", practice:"https://leetcode.com/problems/flood-fill/" },
      { title:"Rotten Oranges", yt:"https://youtu.be/yf3oUhkvqA0", article:"https://takeuforward.org/graph/rotten-oranges/", practice:"https://leetcode.com/problems/rotting-oranges/" },
      { title:"Cycle Detection in Undirected Graph (BFS)", yt:"https://youtu.be/BPlrALf1LDU", article:"https://takeuforward.org/graph/detect-cycle-in-an-undirected-graph-using-bfs/", practice:"https://takeuforward.org/plus" },
      { title:"Cycle Detection in Undirected Graph (DFS)", yt:"https://youtu.be/zQ3zgFypzX4", article:"https://takeuforward.org/graph/detect-cycle-in-an-undirected-graph-using-dfs/", practice:"https://takeuforward.org/plus" },
      { title:"0/1 Matrix (Multi-source BFS)", yt:"https://youtu.be/edXdVwkYHF8", article:"https://takeuforward.org/graph/01-matrix/", practice:"https://leetcode.com/problems/01-matrix/" },
      { title:"Surrounded Regions", yt:"https://youtu.be/BtdgAys4yMk", article:"https://takeuforward.org/graph/surrounded-regions/", practice:"https://leetcode.com/problems/surrounded-regions/" },
  ]},
  { name:"Topo Sort & Directed Graph", problems:[
      { title:"Bipartite Graph (BFS)", yt:"https://youtu.be/nbgaEu-pvkU", article:"https://takeuforward.org/graph/bipartite-graph/", practice:"https://leetcode.com/problems/is-graph-bipartite/" },
      { title:"Bipartite Graph (DFS)", yt:"https://youtu.be/KG5YFfR0j8A", article:"https://takeuforward.org/graph/bipartite-graph/", practice:"https://leetcode.com/problems/is-graph-bipartite/" },
      { title:"Topological Sort (DFS)", yt:"https://youtu.be/5lJ8-TlG7YE", article:"https://takeuforward.org/graph/topological-sort-algorithm-dfs/", practice:"https://takeuforward.org/plus" },
      { title:"Topological Sort – Kahn's Algorithm (BFS)", yt:"https://youtu.be/73sneFXuTEg", article:"https://takeuforward.org/graph/kahns-algorithm-topological-sort/", practice:"https://takeuforward.org/plus" },
      { title:"Cycle Detection in Directed Graph (DFS)", yt:"https://youtu.be/9twcmtQj4DU", article:"https://takeuforward.org/graph/detect-cycle-in-directed-graph-using-dfs-based-approach/", practice:"https://takeuforward.org/plus" },
      { title:"Cycle Detection Directed (Kahn's)", yt:"https://youtu.be/iTBaI90lpDQ", article:"https://takeuforward.org/graph/detect-cycle-directed-graph-kahn/", practice:"https://takeuforward.org/plus" },
      { title:"Course Schedule I & II", yt:"https://youtu.be/WAOfKpxYHR8", article:"https://takeuforward.org/data-structure/course-schedule-ii/", practice:"https://leetcode.com/problems/course-schedule/" },
      { title:"Find Eventual Safe States", yt:"https://youtu.be/uRbJ1OF9aYM", article:"https://takeuforward.org/graph/eventual-safe-states/", practice:"https://leetcode.com/problems/find-eventual-safe-states/" },
      { title:"Alien Dictionary", yt:"https://youtu.be/U3N_je7tWAs", article:"https://takeuforward.org/data-structure/alien-dictionary-topological-sort/", practice:"https://leetcode.com/problems/alien-dictionary/" },
      { title:"Accounts Merge (DSU)", yt:"https://youtu.be/FMwpt_aQOGo", article:"https://takeuforward.org/data-structure/accounts-merge/", practice:"https://leetcode.com/problems/accounts-merge/" },
  ]},
  { name:"Shortest Path Algorithms", problems:[
      { title:"Shortest Path in DAG (Topo Sort)", yt:"https://youtu.be/ZUFQfFaU-8U", article:"https://takeuforward.org/graph/shortest-path-for-directed-acyclic-graphs/", practice:"https://takeuforward.org/plus" },
      { title:"Shortest Path in Undirected Graph (BFS)", yt:"https://youtu.be/C4gxoTaI71U", article:"https://takeuforward.org/graph/shortest-path-in-undirected-graph/", practice:"https://takeuforward.org/plus" },
      { title:"Dijkstra's Algorithm", yt:"https://youtu.be/V6H1qAeB-l4", article:"https://takeuforward.org/graph/dijkstras-algorithm/", practice:"https://leetcode.com/problems/network-delay-time/" },
      { title:"Bellman Ford Algorithm", yt:"https://youtu.be/75yC1vbS8S8", article:"https://takeuforward.org/data-structure/bellman-ford-algorithm-g-41/", practice:"https://takeuforward.org/plus" },
      { title:"Floyd Warshall Algorithm", yt:"https://youtu.be/YbY8cVwWAvw", article:"https://takeuforward.org/graph/floyd-warshall-algorithm/", practice:"https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/" },
      { title:"Word Ladder I", yt:"https://youtu.be/tRPda0rcf8E", article:"https://takeuforward.org/graph/word-ladder-i/", practice:"https://leetcode.com/problems/word-ladder/" },
      { title:"Word Ladder II", yt:"https://youtu.be/DREutrv2XD0", article:"https://takeuforward.org/graph/word-ladder-ii/", practice:"https://leetcode.com/problems/word-ladder-ii/" },
  ]},
  { name:"MST / DSU / Advanced", problems:[
      { title:"Prim's Algorithm – Minimum Spanning Tree", yt:"https://youtu.be/mJcZjjKzeqk", article:"https://takeuforward.org/graph/prims-algorithm-minimum-spanning-tree/", practice:"https://leetcode.com/problems/min-cost-to-connect-all-points/" },
      { title:"Kruskal's Algorithm / Disjoint Set Union", yt:"https://youtu.be/DMnDM_sxVig", article:"https://takeuforward.org/graph/kruskal-algorithm/", practice:"https://leetcode.com/problems/min-cost-to-connect-all-points/" },
      { title:"Strongly Connected Components (Kosaraju)", yt:"https://youtu.be/R6uoSjZ2imo", article:"https://takeuforward.org/graph/strongly-connected-components-kosarajus-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Articulation Points in Graph", yt:"https://youtu.be/j1QX9hxM3S0", article:"https://takeuforward.org/graph/articulation-point-in-graph/", practice:"https://leetcode.com/problems/critical-connections-in-a-network/" },
      { title:"Bridges in Graph", yt:"https://youtu.be/qrAub5z8FeA", article:"https://takeuforward.org/graph/bridges-in-graph/", practice:"https://leetcode.com/problems/critical-connections-in-a-network/" },
      { title:"Number of Ways to Reach Destination (DP+Graph)", yt:"https://youtu.be/PATgNiyd2n0", article:"https://takeuforward.org/graph/number-of-ways-in-maze/", practice:"https://leetcode.com/problems/number-of-paths-in-directed-graph/" },
  ]}
]},
{ step:16, title:"Dynamic Programming [Patterns & Problems]", week:8, subtopics:[
  { name:"Introduction to DP", problems:[
      { title:"Introduction to DP (Memoization & Tabulation)", yt:"https://youtu.be/tyB0ztf0DNY", article:"https://takeuforward.org/data-structure/dynamic-programming-introduction/", practice:"https://leetcode.com/problems/climbing-stairs/" },
      { title:"Climbing Stairs", yt:"https://youtu.be/mJfkuCHMPxc", article:"https://takeuforward.org/data-structure/climbing-stairs/", practice:"https://leetcode.com/problems/climbing-stairs/" },
      { title:"Frog Jump (1D DP)", yt:"https://youtu.be/EgG3jsGoPvg", article:"https://takeuforward.org/data-structure/frog-jump-dp-3/", practice:"https://takeuforward.org/plus" },
      { title:"Frog Jump with K Distances", yt:"https://youtu.be/Kmh3rhyEtB8", article:"https://takeuforward.org/data-structure/frog-jump-with-k-distances-dp-4/", practice:"https://takeuforward.org/plus" },
      { title:"Maximum Sum of Non-Adjacent Elements", yt:"https://youtu.be/GrMBfJNk_NY", article:"https://takeuforward.org/data-structure/maximum-sum-of-non-adjacent-elements/", practice:"https://leetcode.com/problems/house-robber/" },
      { title:"House Robber II", yt:"https://youtu.be/3WaqgiPTagY", article:"https://takeuforward.org/data-structure/house-robber-2/", practice:"https://leetcode.com/problems/house-robber-ii/" },
  ]},
  { name:"2D / Grid DP", problems:[
      { title:"Ninja's Training (2D DP)", yt:"https://youtu.be/AE39gJYuRog", article:"https://takeuforward.org/data-structure/ninja-s-training-dp-7/", practice:"https://takeuforward.org/plus" },
      { title:"Unique Paths in Grid", yt:"https://youtu.be/t_f0nwwdg5o", article:"https://takeuforward.org/data-structure/grid-unique-paths-count-paths-from-left-top-to-the-right-bottom-of-a-matrix/", practice:"https://leetcode.com/problems/unique-paths/" },
      { title:"Unique Paths II (Obstacles)", yt:"https://youtu.be/TmhpgXScLyY", article:"https://takeuforward.org/data-structure/unique-paths-ii-dp-9/", practice:"https://leetcode.com/problems/unique-paths-ii/" },
      { title:"Minimum Path Sum in Grid", yt:"https://youtu.be/_rgTlyky1uQ", article:"https://takeuforward.org/data-structure/minimum-path-sum-in-grid/", practice:"https://leetcode.com/problems/minimum-path-sum/" },
      { title:"Triangle – Minimum Path Sum", yt:"https://youtu.be/SrP-PiLSYC0", article:"https://takeuforward.org/data-structure/minimum-path-sum-in-triangular-grid/", practice:"https://leetcode.com/problems/triangle/" },
      { title:"Minimum / Maximum Falling Path Sum", yt:"https://youtu.be/N_aJ5pRuxuo", article:"https://takeuforward.org/data-structure/minimum-maximum-falling-path-sum/", practice:"https://leetcode.com/problems/minimum-falling-path-sum/" },
      { title:"Cherry Pickup II (3D DP)", yt:"https://youtu.be/QGfn7JeXK54", article:"https://takeuforward.org/data-structure/3-d-dp-ninja-and-his-friends-dp-13/", practice:"https://leetcode.com/problems/cherry-pickup-ii/" },
  ]},
  { name:"DP on Subsequences", problems:[
      { title:"Subset Sum Equals Target", yt:"https://youtu.be/F7wqWbqYn9g", article:"https://takeuforward.org/data-structure/subset-sum-equal-to-target-dp-14/", practice:"https://takeuforward.org/plus" },
      { title:"Partition Equal Subset Sum", yt:"https://youtu.be/7win3dcgo3k", article:"https://takeuforward.org/data-structure/partition-equal-subset-sum-dp-15/", practice:"https://leetcode.com/problems/partition-equal-subset-sum/" },
      { title:"Partition Two Subsets with Min Difference", yt:"https://youtu.be/GS_OqZb2CWc", article:"https://takeuforward.org/data-structure/minimum-absolute-difference-in-partition/", practice:"https://leetcode.com/problems/last-stone-weight-ii/" },
      { title:"0/1 Knapsack", yt:"https://youtu.be/GqOTyWuiBOQ", article:"https://takeuforward.org/data-structure/0-1-knapsack-dp-19/", practice:"https://takeuforward.org/plus" },
      { title:"Coin Change – Minimum Coins", yt:"https://youtu.be/myPeWb3X9Ow", article:"https://takeuforward.org/data-structure/minimum-number-of-coins/", practice:"https://leetcode.com/problems/coin-change/" },
      { title:"Coin Change II – Number of Ways", yt:"https://youtu.be/HgyouUi11zk", article:"https://takeuforward.org/data-structure/count-partitions-with-given-difference-dp-18/", practice:"https://leetcode.com/problems/coin-change-ii/" },
      { title:"Target Sum (Assign +/- to Nums)", yt:"https://youtu.be/b3GmCYQfIvY", article:"https://takeuforward.org/data-structure/target-sum-dp-21/", practice:"https://leetcode.com/problems/target-sum/" },
      { title:"Rod Cutting", yt:"https://youtu.be/mO8XpGoJwuo", article:"https://takeuforward.org/data-structure/rod-cutting-problem-dp-24/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"DP on Strings", problems:[
      { title:"Longest Common Subsequence", yt:"https://youtu.be/-Le6aYQnxqg", article:"https://takeuforward.org/data-structure/longest-common-subsequence-dp-25/", practice:"https://leetcode.com/problems/longest-common-subsequence/" },
      { title:"Longest Common Substring", yt:"https://youtu.be/BBgesL03LF0", article:"https://takeuforward.org/data-structure/longest-common-substring/", practice:"https://takeuforward.org/plus" },
      { title:"Longest Palindromic Subsequence", yt:"https://youtu.be/6i_T5kkfv4A", article:"https://takeuforward.org/data-structure/longest-palindromic-subsequence-dp-28/", practice:"https://leetcode.com/problems/longest-palindromic-subsequence/" },
      { title:"Minimum Insertions to Make Palindrome", yt:"https://youtu.be/xPBLEj41rFU", article:"https://takeuforward.org/data-structure/minimum-insertions-to-make-string-palindrome/", practice:"https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/" },
      { title:"Minimum Insertions/Deletions to Convert", yt:"https://youtu.be/yMnH0jrir0Q", article:"https://takeuforward.org/data-structure/minimum-insertions-deletions-to-convert-string/", practice:"https://leetcode.com/problems/delete-operation-for-two-strings/" },
      { title:"Shortest Common Supersequence", yt:"https://youtu.be/xElWj5nLHOY", article:"https://takeuforward.org/data-structure/shortest-common-supersequence/", practice:"https://leetcode.com/problems/shortest-common-supersequence/" },
      { title:"Distinct Subsequences", yt:"https://youtu.be/nVG7eTiD2bY", article:"https://takeuforward.org/data-structure/distinct-subsequences-dp-32/", practice:"https://leetcode.com/problems/distinct-subsequences/" },
      { title:"Edit Distance", yt:"https://youtu.be/qMky6D6YtXU", article:"https://takeuforward.org/data-structure/edit-distance-dp-33/", practice:"https://leetcode.com/problems/edit-distance/" },
      { title:"Wildcard Matching", yt:"https://youtu.be/ZmlQ3vgAOMo", article:"https://takeuforward.org/data-structure/wildcard-matching-dp-34/", practice:"https://leetcode.com/problems/wildcard-matching/" },
  ]},
  { name:"DP on Stocks", problems:[
      { title:"Best Time to Buy and Sell Stock I", yt:"https://youtu.be/excAOvwF_Wk", article:"https://takeuforward.org/data-structure/stock-buy-and-sell-dp-35/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
      { title:"Buy & Sell Stock II (Multiple Transactions)", yt:"https://youtu.be/nGJTWaaFdjc", article:"https://takeuforward.org/data-structure/buy-and-sell-stock-ii-dp-36/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/" },
      { title:"Buy & Sell Stock III (At Most 2 Trans.)", yt:"https://youtu.be/wuzTpONbd-g", article:"https://takeuforward.org/data-structure/buy-and-sell-stocks-iii-dp-37/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/" },
      { title:"Buy & Sell Stock IV (At Most K Trans.)", yt:"https://youtu.be/IV1dHbk5Zm4", article:"https://takeuforward.org/data-structure/buy-and-sell-stocks-iv-dp-38/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/" },
      { title:"Buy & Sell Stock with Cooldown", yt:"https://youtu.be/IGHlN4DXOBM", article:"https://takeuforward.org/data-structure/buy-and-sell-stock-with-cooldown-dp-39/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/" },
      { title:"Buy & Sell Stock with Transaction Fee", yt:"https://youtu.be/pTakjtNMTgs", article:"https://takeuforward.org/data-structure/buy-and-sell-stocks-with-transaction-fee-dp-40/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/" },
  ]},
  { name:"DP on LIS", problems:[
      { title:"Longest Increasing Subsequence (DP)", yt:"https://youtu.be/ekcwMsSIzVc", article:"https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/", practice:"https://leetcode.com/problems/longest-increasing-subsequence/" },
      { title:"LIS using Binary Search O(NlogN)", yt:"https://youtu.be/on2hvxBXJH4", article:"https://takeuforward.org/data-structure/longest-increasing-subsequence-binary-search-dp-43/", practice:"https://leetcode.com/problems/longest-increasing-subsequence/" },
      { title:"Largest Divisible Subset", yt:"https://youtu.be/gDuZwBW9VvM", article:"https://takeuforward.org/data-structure/largest-divisible-subset-dp-44/", practice:"https://leetcode.com/problems/largest-divisible-subset/" },
      { title:"Longest String Chain", yt:"https://youtu.be/YY8iBaYcc4g", article:"https://takeuforward.org/data-structure/longest-string-chain-dp-45/", practice:"https://leetcode.com/problems/longest-string-chain/" },
      { title:"Longest Bitonic Subsequence", yt:"https://youtu.be/y4vN0WNdrlg", article:"https://takeuforward.org/data-structure/longest-bitonic-subsequence-dp-46/", practice:"https://takeuforward.org/plus" },
      { title:"Number of LIS", yt:"https://youtu.be/cKVl1TFdNXg", article:"https://takeuforward.org/data-structure/count-of-lis-dp-47/", practice:"https://leetcode.com/problems/number-of-longest-increasing-subsequence/" },
  ]},
  { name:"DP on MCM / Partition DP", problems:[
      { title:"Matrix Chain Multiplication (MCM)", yt:"https://youtu.be/pDCXsbAeX4c", article:"https://takeuforward.org/data-structure/matrix-chain-multiplication-dp-48/", practice:"https://takeuforward.org/plus" },
      { title:"Minimum Cost to Cut a Stick", yt:"https://youtu.be/xwomavsC86c", article:"https://takeuforward.org/data-structure/minimum-cost-to-cut-the-stick-dp-50/", practice:"https://leetcode.com/problems/minimum-cost-to-cut-a-stick/" },
      { title:"Burst Balloons", yt:"https://youtu.be/Yz4LlDSlkns", article:"https://takeuforward.org/data-structure/burst-balloons-dp-51/", practice:"https://leetcode.com/problems/burst-balloons/" },
      { title:"Evaluate Boolean Expression (True / False ways)", yt:"https://youtu.be/MM7fXopgyjw", article:"https://takeuforward.org/data-structure/evaluate-boolean-expression-to-true-dp-52/", practice:"https://takeuforward.org/plus" },
      { title:"Palindrome Partitioning II (Min Cuts)", yt:"https://youtu.be/_H8V5hJUGd0", article:"https://takeuforward.org/data-structure/palindrome-partitioning-ii-front-partition-dp-54/", practice:"https://leetcode.com/problems/palindrome-partitioning-ii/" },
      { title:"Partition Array for Maximum Sum", yt:"https://youtu.be/PhWENd3ggns", article:"https://takeuforward.org/data-structure/partition-array-for-maximum-sum-dp-55/", practice:"https://leetcode.com/problems/partition-array-for-maximum-sum/" },
  ]}
]},
{ step:17, title:"Tries [Concepts and Problems]", week:8, subtopics:[
  { name:"Theory", problems:[
      { title:"Implement Trie I (Insert, Search, StartsWith)", yt:"https://youtu.be/dBGUmUQhjaM", article:"https://takeuforward.org/data-structure/implement-trie-i/", practice:"https://leetcode.com/problems/implement-trie-prefix-tree/" },
      { title:"Implement Trie II (Count Prefix, Erase)", yt:"https://youtu.be/K5pcpkEMCN0", article:"https://takeuforward.org/data-structure/implement-trie-ii/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Problems", problems:[
      { title:"Longest String with All Prefixes (Complete String)", yt:"https://youtu.be/AWnBa91lThI", article:"https://takeuforward.org/data-structure/longest-string-with-all-prefixes/", practice:"https://takeuforward.org/plus" },
      { title:"Number of Distinct Substrings", yt:"https://youtu.be/RV0QETsfAAo", article:"https://takeuforward.org/data-structure/number-of-distinct-substrings-in-a-string/", practice:"https://takeuforward.org/plus" },
      { title:"Maximum XOR of Two Numbers in Array", yt:"https://youtu.be/BTf05gs_8iU", article:"https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/", practice:"https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
      { title:"Maximum XOR with Element from Array", yt:"https://youtu.be/Q8LhG9Pi5KM", article:"https://takeuforward.org/data-structure/maximum-xor-with-an-element-from-array/", practice:"https://leetcode.com/problems/maximum-xor-with-an-element-from-array/" },
      { title:"Word Search II (Trie + Backtracking)", yt:"https://youtu.be/asbcE9mZz_U", article:"https://takeuforward.org/data-structure/word-search-ii/", practice:"https://leetcode.com/problems/word-search-ii/" },
      { title:"Replace Words (Dictionary to Roots)", yt:"https://youtu.be/RV0QETsfAAo", article:"https://takeuforward.org/data-structure/replace-words/", practice:"https://leetcode.com/problems/replace-words/" },
      { title:"Design Add and Search Words Data Structure", yt:"https://youtu.be/BTf05gs_8iU", article:"https://takeuforward.org/data-structure/design-add-search-words-structure/", practice:"https://leetcode.com/problems/design-add-and-search-words-data-structure/" },
      { title:"Palindrome Pairs using Trie", yt:"https://youtu.be/AWnBa91lThI", article:"https://takeuforward.org/data-structure/palindrome-pairs/", practice:"https://leetcode.com/problems/palindrome-pairs/" },
  ]},
  { name:"LeetCode Practice Set", problems:[
      { title:"Implement Trie (Prefix Tree)", practice:"https://leetcode.com/problems/implement-trie-prefix-tree/" },
      { title:"Design Add and Search Words Data Structure", practice:"https://leetcode.com/problems/design-add-and-search-words-data-structure/" },
      { title:"Word Search II (Trie + Backtracking)", practice:"https://leetcode.com/problems/word-search-ii/" },
      { title:"Longest Word in Dictionary", practice:"https://leetcode.com/problems/longest-word-in-dictionary/" },
      { title:"Replace Words", practice:"https://leetcode.com/problems/replace-words/" },
      { title:"Map Sum Pairs", practice:"https://leetcode.com/problems/map-sum-pairs/" },
      { title:"Maximum XOR of Two Numbers in Array", practice:"https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
      { title:"Maximum XOR with Element from Array", practice:"https://leetcode.com/problems/maximum-xor-with-an-element-from-array/" },
      { title:"Palindrome Pairs", practice:"https://leetcode.com/problems/palindrome-pairs/" },
      { title:"Search Suggestions System", practice:"https://leetcode.com/problems/search-suggestions-system/" },
      { title:"Stream of Characters", practice:"https://leetcode.com/problems/stream-of-characters/" },
      { title:"Top K Frequent Words", practice:"https://leetcode.com/problems/top-k-frequent-words/" },
      { title:"Short Encoding of Words", practice:"https://leetcode.com/problems/short-encoding-of-words/" },
      { title:"Camelcase Matching", practice:"https://leetcode.com/problems/camelcase-matching/" },
      { title:"Index Pairs of a String", practice:"https://leetcode.com/problems/index-pairs-of-a-string/" },
  ]}
]}
];

const STEP_LEETCODE = {};
STRIVER_STEPS.forEach(step => { STEP_LEETCODE[step.step] = step.subtopics.flatMap(sub => sub.problems.map(p => ({ title: p.title, url: p.practice }))); });
const DSA_TABLE = STRIVER_STEPS.flatMap(step =>
step.subtopics.map((sub, si) => ({
id: `s${step.step}_${si}`,
step: step.step,
stepTitle: step.title,
topic: sub.name,
problems: sub.problems.length,
solved: 0,
confidence: 0,
revisionRequired: false,
status: "pending",
week: step.week,
}))
);

// ─── COA DATA (Nesa Academy – Computer Organization & Architecture) ──────────
const COA_TABLE = [
  { id:"coa_01", topic:"Introduction to Computer Organization", week:1, subtopics:"Overview, Von Neumann architecture, basic components", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_02", topic:"Number Systems & Data Representation", week:1, subtopics:"Binary, Octal, Hex, BCD, IEEE 754 floating point", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_03", topic:"Boolean Algebra & Logic Gates", week:1, subtopics:"AND, OR, NOT, NAND, NOR, XOR, truth tables, simplification", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_04", topic:"Combinational Circuits", week:2, subtopics:"Adders, subtractors, multiplexers, demultiplexers, encoders, decoders", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_05", topic:"Sequential Circuits", week:2, subtopics:"Flip-flops (SR, JK, D, T), registers, counters", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_06", topic:"CPU Organisation & Instruction Set", week:3, subtopics:"ALU, control unit, registers, instruction formats, addressing modes", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_07", topic:"Instruction Cycle & Microprogramming", week:3, subtopics:"Fetch-decode-execute, micro-operations, hardwired vs microprogrammed control", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_08", topic:"Pipelining", week:4, subtopics:"Pipeline stages, hazards (structural, data, control), solutions", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_09", topic:"Memory Organisation", week:4, subtopics:"Hierarchy, cache (direct, associative, set-associative), virtual memory, paging", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_10", topic:"Input / Output Organisation", week:5, subtopics:"I/O interfaces, programmed I/O, interrupt-driven I/O, DMA", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_11", topic:"Buses & Interconnects", week:5, subtopics:"Bus structure, synchronous vs asynchronous, arbitration, PCI/PCIe basics", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_12", topic:"Arithmetic Operations in Hardware", week:6, subtopics:"Integer addition/subtraction, multiplication (Booth's), division, floating-point ops", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_13", topic:"RISC vs CISC", week:6, subtopics:"Design philosophy, pipeline friendliness, examples (x86 vs ARM)", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_14", topic:"Parallel Processing", week:7, subtopics:"Flynn's taxonomy, SIMD/MIMD, multiprocessors, cache coherence", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_15", topic:"Performance Metrics & Optimisation", week:7, subtopics:"CPI, MIPS, Amdahl's law, branch prediction, out-of-order execution", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_16", topic:"Assembly Language Basics", week:8, subtopics:"Registers, MOV/ADD/SUB/JMP, stack operations, calling conventions", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_17", topic:"Revision & Past Papers", week:8, subtopics:"Previous year questions, formula sheet, Nesa model papers", practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
];

// ─── WEEK PLAN (8-week roadmap mapping DSA steps to COA weeks) ───────────────
const WEEK_PLAN = [
  { week:1, title:"Basics, Sorting & Arrays (Easy)", dsaSteps:[1,2], coaWeek:1 },
  { week:2, title:"Arrays (Medium/Hard) & Strings", dsaSteps:[3], coaWeek:2 },
  { week:3, title:"Searching, Recursion & Backtracking", dsaSteps:[4,5], coaWeek:3 },
  { week:4, title:"Binary Trees & BST", dsaSteps:[6,7], coaWeek:4 },
  { week:5, title:"Linked Lists & Stacks/Queues", dsaSteps:[8,9], coaWeek:5 },
  { week:6, title:"Greedy, Binary Search & Heaps", dsaSteps:[10,11], coaWeek:6 },
  { week:7, title:"Graphs & Dynamic Programming", dsaSteps:[12,13,14], coaWeek:7 },
  { week:8, title:"Advanced DP, Tries & Revision", dsaSteps:[15,16,17], coaWeek:8 },
];

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
    function getDiffFromSubtopic(name) {
        if (!name) return null;
        const n = name.toLowerCase();
        if (n.includes("easy")) return "Easy";
        if (n.includes("hard")) return "Hard";
        if (n.includes("medium")) return "Medium";
        return null;
    }
    const DIFF_STYLE = {
        Easy:   { background:"#052e1a", color:"#34d399", border:"1px solid #16533a" },
        Medium: { background:"#2d1f04", color:"#fbbf24", border:"1px solid #78450a" },
        Hard:   { background:"#3b0a0a", color:"#f87171", border:"1px solid #7f1d1d" },
    };

    function DSATracker({ dsaData, setDsaData, setDailyLog, lastLogDate }) {
    const [search, setSearch] = useState("");
    const [expandedStep, setExpandedStep] = useState(null);
    const [expandedSub, setExpandedSub] = useState(null);
    const [solvedQuestions, setSolvedQuestions] = useLocalStorage("a2z_solved", {});
    const [diffFilter, setDiffFilter] = useState("All");
    const [lcSyncing, setLcSyncing] = useState(false);
    const [lcSyncMsg, setLcSyncMsg] = useState("");

    function recomputeDsaData(solved) {
        setDsaData(curr => curr.map(d => {
            const m = d.id.match(/^s(\d+)_(\d+)$/);
            if (!m) return d;
            const [, stepStr, subStr] = m;
            const pfx = `s${stepStr}_${subStr}_`;
            const totalSolved = Object.keys(solved).filter(k => k.startsWith(pfx) && solved[k]).length;
            return { ...d, solved: totalSolved, status: totalSolved >= d.problems ? "done" : totalSolved > 0 ? "inprogress" : "pending" };
        }));
    }

    async function syncFromLeetCode() {
        setLcSyncing(true);
        setLcSyncMsg("Fetching your LeetCode submissions…");
        try {
            const res = await fetch("https://alfa-leetcode-api.onrender.com/userProfile/Nirattay");
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            const accepted = new Set(
                (data.recentSubmissions || [])
                    .filter(s => s.statusDisplay === "Accepted")
                    .map(s => s.titleSlug)
            );
            const newSolved = { ...solvedQuestions };
            let count = 0;
            STRIVER_STEPS.forEach(sg => {
                sg.subtopics.forEach((sub, si) => {
                    sub.problems.forEach((p, pi) => {
                        if (p.practice && p.practice.includes("leetcode.com/problems/")) {
                            const slug = p.practice.replace(/\/$/, "").split("/problems/")[1]?.split("/")[0];
                            if (slug && accepted.has(slug) && !newSolved[`s${sg.step}_${si}_${pi}`]) {
                                newSolved[`s${sg.step}_${si}_${pi}`] = true;
                                count++;
                            }
                        }
                    });
                });
            });
            setSolvedQuestions(newSolved);
            recomputeDsaData(newSolved);
            setLcSyncMsg(`✓ Marked ${count} new problem${count !== 1 ? "s" : ""} as solved from LeetCode!`);
        } catch {
            setLcSyncMsg("⚠ Could not fetch LeetCode data. Try again.");
        }
        setLcSyncing(false);
    }

    function toggleSolved(stepNum, subIdx, probIdx) {
        const key = `s${stepNum}_${subIdx}_${probIdx}`;
        setSolvedQuestions(prev => {
            const isSolved = !prev[key];
            const next = { ...prev, [key]: isSolved };
            const subId = `s${stepNum}_${subIdx}`;
            const totalSolved = Object.keys(next).filter(k => k.startsWith(`s${stepNum}_${subIdx}_`) && next[k]).length;
            setDsaData(curr => curr.map(d => {
                if (d.id !== subId) return d;
                return { ...d, solved: totalSolved, status: totalSolved >= d.problems ? "done" : totalSolved > 0 ? "inprogress" : "pending" };
            }));
            // Auto-log today when marking solved (not when unchecking)
            if (isSolved) {
                const today = new Date().toISOString().slice(0,10);
                if (lastLogDate !== today) {
                    setDailyLog(logs => {
                        if (logs.length > 0 && logs[0].date === today) return logs;
                        return [{ date: today, note: "Solved problems in DSA tracker 💻", ts: Date.now() }, ...logs.slice(0, 19)];
                    });
                }
            }
            return next;
        });
    }

    const totalProblems = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedProbs = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);
    const doneSubs = dsaData.filter(d=>d.status==="done").length;

    const filteredSteps = useMemo(() => {
        return STRIVER_STEPS.map(s => {
            const seenTitles = new Set();
            return {
                ...s,
                subtopics: s.subtopics.map((sub, si) => {
                    const match = !search || sub.name.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase());
                    if (!match) return null;
                    const dedupedProblems = sub.problems
                        .map((p, pi) => ({ ...p, _origIdx: pi }))
                        .filter(p => {
                            const key = p.title.toLowerCase().trim();
                            if (seenTitles.has(key)) return false;
                            seenTitles.add(key);
                            return true;
                        });
                    return { ...sub, problems: dedupedProblems };
                }).filter(Boolean)
            };
        }).filter(s => s.subtopics.length > 0);
    }, [search]);

    return <div>
        <div style={S.pageTitle}>DSA Tracker</div>
        <div style={{...S.pageSub,marginBottom:12}}>Striver A2Z · 17 Steps · 474 Problems · {doneSubs}/{dsaData.length} subtopics · {solvedProbs}/{totalProblems} problems solved</div>
        <PBar pct={totalProblems ? Math.round(solvedProbs/totalProblems*100) : 0} color="#818cf8" height={5} />
        <div style={{marginBottom:16}} />

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
            {[{l:"Total Problems",v:totalProblems,c:"#818cf8"},{l:"Subtopics Solved",v:solvedProbs,c:"#34d399"},{l:"Subtopics Done",v:doneSubs,c:"#60a5fa"},{l:"Completion",v:`${totalProblems ? Math.round(solvedProbs/totalProblems*100) : 0}%`,c:"#fb923c"}].map((s,i)=>
            <div key={i} style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:10,padding:"12px 14px"}}>
                <div style={S.statLabel}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
            )}
        </div>

        <div style={{...S.filterBar, flexWrap:"wrap", gap:8}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subtopics or steps…" style={{...S.searchInput, flex:1, minWidth:160}}/>
            <div style={{display:"flex", gap:5}}>
                {["All","Easy","Medium","Hard"].map(d => (
                    <button key={d} onClick={()=>setDiffFilter(d)} style={{
                        padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
                        background: diffFilter===d ? (d==="Easy"?"#052e1a":d==="Medium"?"#2d1f04":d==="Hard"?"#3b0a0a":"#1e2030") : "transparent",
                        color: diffFilter===d ? (d==="Easy"?"#34d399":d==="Medium"?"#fbbf24":d==="Hard"?"#f87171":"#818cf8") : "#64748b",
                        outline: diffFilter===d ? `1px solid ${d==="Easy"?"#16533a":d==="Medium"?"#78450a":d==="Hard"?"#7f1d1d":"#3d4475"}` : "1px solid transparent"
                    }}>{d}</button>
                ))}
            </div>
            <button onClick={syncFromLeetCode} disabled={lcSyncing} style={{
                padding:"5px 14px", borderRadius:20, fontSize:11, fontWeight:700, cursor:lcSyncing?"wait":"pointer",
                border:"1px solid #1e293b", background:"#0f172a", color:lcSyncing?"#475569":"#818cf8", whiteSpace:"nowrap"
            }}>
                {lcSyncing ? "⏳ Syncing…" : "⟳ Sync LeetCode"}
            </button>
            {lcSyncMsg && <span style={{fontSize:11, color:lcSyncMsg.startsWith("✓")?"#34d399":"#fb923c", alignSelf:"center"}}>{lcSyncMsg}</span>}
        </div>

        {filteredSteps.map(sg => {
            const exp = expandedStep === sg.step;
            const stepProbs = sg.subtopics.reduce((a,sub)=>a+sub.problems.length,0);
            const stepSolved = sg.subtopics.reduce((a,sub,si)=>{
                return a + sub.problems.filter((_,pi)=>solvedQuestions[`s${sg.step}_${si}_${pi}`]).length;
            },0);

            return <div key={sg.step} style={{marginBottom:10}}>
                <div onClick={()=>setExpandedStep(exp?null:sg.step)} style={{background:"#0f1117",border:`1px solid ${exp?"#2d3154":"#1e2030"}`,borderRadius: exp?"10px 10px 0 0":10,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:30,height:30,borderRadius:7,background:(STEP_COLORS[sg.step]||"#fff")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:STEP_COLORS[sg.step]||"#fff"}}>S{sg.step}</div>
                        <div>
                            <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{sg.title}</div>
                            <div style={{fontSize:11,color:"#475569"}}>{stepSolved}/{stepProbs} problems · Week {sg.week||1}</div>
                        </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:80}}>
                            <PBar pct={stepProbs ? Math.round(stepSolved/stepProbs*100) : 0} color={STEP_COLORS[sg.step]||"#fff"} />
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:STEP_COLORS[sg.step]||"#fff"}}>{stepProbs ? Math.round(stepSolved/stepProbs*100) : 0}%</span>
                        <span style={{color:"#475569"}}>{exp?"▲":"▼"}</span>
                    </div>
                </div>
                
                {exp && <div style={{background:"#0a0b0d",border:"1px solid #1e2030",borderTop:"none",padding:"12px",borderRadius:"0 0 10px 10px"}}>
                    {sg.subtopics.map((sub, si) => {
                        const subId = `s${sg.step}_${si}`;
                        const subExp = expandedSub === subId;
                        const subSolved = sub.problems.filter(p=>solvedQuestions[`s${sg.step}_${si}_${p._origIdx}`]).length;
                        
                        return <div key={si} style={{marginBottom:8, border:"1px solid #1e2030", borderRadius:6, overflow:"hidden"}}>
                            <div onClick={()=>setExpandedSub(subExp?null:subId)} style={{background:"#11131a", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer"}}>
                                <div style={{fontSize:13, fontWeight:600, color:"#cbd5e1"}}>Step {sg.step}.{si+1}: {sub.name}</div>
                                <div style={{display:"flex", alignItems:"center", gap:10}}>
                                    <div style={{fontSize:11, color:"#64748b"}}>{subSolved}/{sub.problems.length} Solved</div>
                                    <span style={{color:"#475569", fontSize:12}}>{subExp?"▲":"▼"}</span>
                                </div>
                            </div>
                            
                            {subExp && <div style={{background:"#0a0b0d"}}>
                                <table style={{width:"100%", borderCollapse:"collapse", fontSize:12, textAlign:"left"}}>
                                    <thead>
                                        <tr style={{borderBottom:"1px solid #1e2030", color:"#64748b"}}>
                                            <th style={{padding:"8px 12px", width:40}}>Status</th>
                                            <th style={{padding:"8px 12px"}}>Problem</th>
                                            <th style={{padding:"8px 12px", width:80}}>Difficulty</th>
                                            <th style={{padding:"8px 12px", width:50, textAlign:"center"}}>Article</th>
                                            <th style={{padding:"8px 12px", width:50, textAlign:"center"}}>Video</th>
                                            <th style={{padding:"8px 12px", width:60, textAlign:"center"}}>Practice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sub.problems
                                            .filter(p => {
                                                if (diffFilter === "All") return true;
                                                const d = p.difficulty || getDiffFromSubtopic(sub.name);
                                                return d === diffFilter;
                                            })
                                            .map(p => {
                                            const pi = p._origIdx;
                                            const isDone = !!solvedQuestions[`s${sg.step}_${si}_${pi}`];
                                            const diff = p.difficulty || getDiffFromSubtopic(sub.name);
                                            const hasArticle = p.article && !p.article.endsWith("/plus") && !p.article.endsWith("/plus/");
                                            const hasYT = p.yt && (p.yt.includes("youtu.be") || p.yt.includes("youtube.com"));
                                            const hasPractice = p.practice && !p.practice.includes("takeuforward.org");
                                            return <tr key={pi} style={{borderBottom:"1px solid #1e2030", background:isDone?"#052e1620":"transparent", transition:"0.2s"}}>
                                                <td style={{padding:"8px 12px"}}>
                                                    <input type="checkbox" checked={isDone} onChange={()=>toggleSolved(sg.step, si, pi)} style={{accentColor:"#34d399", cursor:"pointer"}} />
                                                </td>
                                                <td style={{padding:"8px 12px", color:isDone?"#34d399":"#e2e8f0", textDecoration:isDone?"line-through":"none"}}>{p.title}</td>
                                                <td style={{padding:"8px 12px"}}>
                                                    {diff
                                                        ? <span style={{...DIFF_STYLE[diff], padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700, whiteSpace:"nowrap"}}>{diff}</span>
                                                        : <span style={{color:"#334155", fontSize:11}}>—</span>}
                                                </td>
                                                <td style={{padding:"8px 12px", textAlign:"center"}}>
                                                    {hasArticle && <a href={p.article} target="_blank" rel="noreferrer" title="Read Article" style={{color:"#60a5fa", textDecoration:"none", fontSize:15}}>📝</a>}
                                                </td>
                                                <td style={{padding:"8px 12px", textAlign:"center"}}>
                                                    {hasYT && <a href={p.yt} target="_blank" rel="noreferrer" title="Watch on YouTube" style={{textDecoration:"none", display:"inline-flex", verticalAlign:"middle"}}>
                                                        <svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg">
                                                            <rect width="20" height="14" rx="3" fill="#FF0000"/>
                                                            <polygon points="8,3.5 8,10.5 14,7" fill="white"/>
                                                        </svg>
                                                    </a>}
                                                </td>
                                                <td style={{padding:"8px 12px", textAlign:"center"}}>
                                                    {hasPractice && <a href={p.practice} target="_blank" rel="noreferrer" title="Solve on LeetCode" style={{textDecoration:"none", display:"inline-flex", verticalAlign:"middle"}}>
                                                        <svg width="18" height="18" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                                            <rect width="50" height="50" rx="8" fill="#FFA116"/>
                                                            <path d="M16 34 L10 25 L16 16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                            <path d="M28 16 L34 25 L28 34" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                            <line x1="20" y1="30" x2="30" y2="20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                                                        </svg>
                                                    </a>}
                                                </td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                            </div>}
                        </div>
                    })}
                </div>}
            </div>
        })}
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
                <DSATracker dsaData={dsaData} setDsaData={setDsaData} setDailyLog={setDailyLog} lastLogDate={lastLogDate} />}
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