import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import CalendarTab from "./CalendarTab.jsx";
import { supabase, loadUserProgress, saveUserProgress } from "./supabase.js";
import AuthPage from "./AuthPage.jsx";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";


// ─── STRIVER A2Z SHEET DATA (NEW NESTED STRUCTURE) ─────────────────────────
const STRIVER_STEPS = [
{ step:1, title:"Learn the Basics", week:1, subtopics:[
  { name:"Things to Know in C++, Java, Python or any language", problems:[
      { title:"User Input / Output", yt:"https://youtu.be/FPvPEA0Bkoo", practice:"https://takeuforward.org/plus" },{ title:"Data Types", yt:"https://youtu.be/FPvPEA0Bkoo", practice:"https://takeuforward.org/plus" },{ title:"If Else statements", yt:"https://youtu.be/FPvPEA0Bkoo", practice:"https://takeuforward.org/plus" },{ title:"Switch Statement", yt:"https://youtu.be/FPvPEA0Bkoo", practice:"https://takeuforward.org/plus" },{ title:"arrays, strings", yt:"https://youtu.be/FPvPEA0Bkoo", practice:"https://takeuforward.org/plus" },{ title:"For loops, while loops", yt:"https://youtu.be/FPvPEA0Bkoo", practice:"https://takeuforward.org/plus" },
  ]},{ name:"Build-up Logical Thinking", problems:[
      { title:"Pattern 1", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-1/", practice:"https://takeuforward.org/plus" },{ title:"Pattern 2", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-2/", practice:"https://takeuforward.org/plus" },{ title:"Pattern 3", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-3/", practice:"https://takeuforward.org/plus" },
  ]},{ name:"Learn STL", problems:[
      { title:"Pairs, Vectors, Maps, Sets", yt:"https://youtu.be/RRVYpIET_RU", practice:"https://takeuforward.org/plus" }
  ]},{ name:"Know Basic Maths", problems:[
      { title:"Count Digits", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/count-digits-in-a-number/", practice:"https://leetcode.com/problems/count-primes/", difficulty:"Medium" },{ title:"Reverse a Number", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/reverse-a-number/", practice:"https://leetcode.com/problems/reverse-integer/", difficulty:"Medium" },{ title:"Check Palindrome", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-palindrome-or-not/", practice:"https://leetcode.com/problems/palindrome-number/", difficulty:"Easy" },{ title:"GCD Or HCF", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/find-gcd-of-two-numbers/", practice:"https://leetcode.com/problems/find-greatest-common-divisor-of-array/", difficulty:"Easy" },{ title:"Armstrong Numbers", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-armstrong-number-or-not/", practice:"https://leetcode.com/problems/armstrong-number/", difficulty:"Easy" },{ title:"Print all Divisors", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/print-all-divisors-of-a-given-number/", practice:"https://takeuforward.org/plus" },{ title:"Check for Prime", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-prime-or-not/", practice:"https://takeuforward.org/plus" },{ title:"Happy Number", practice:"https://leetcode.com/problems/happy-number/", difficulty:"Easy" },{ title:"Ugly Number", practice:"https://leetcode.com/problems/ugly-number/", difficulty:"Easy" },{ title:"Add Digits", practice:"https://leetcode.com/problems/add-digits/", difficulty:"Easy" },{ title:"Power of Three", practice:"https://leetcode.com/problems/power-of-three/", difficulty:"Easy" },{ title:"Number of Steps to Reduce a Number to Zero", practice:"https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/", difficulty:"Easy" },{ title:"Count Common Factors", practice:"https://leetcode.com/problems/count-common-factors/" },{ title:"Trailing Zeroes in Factorial", practice:"https://leetcode.com/problems/factorial-trailing-zeroes/", difficulty:"Medium" }
  ]},{ name:"Learn Basic Recursion", problems:[
      { title:"Understand recursion by print something N times", yt:"https://youtu.be/yVdKa8dnKiE", article:"https://takeuforward.org/recursion/print-name-n-times-using-recursion/", practice:"https://takeuforward.org/plus" },{ title:"Print 1 to N using recursion", yt:"https://youtu.be/un6PLygfXrA", article:"https://takeuforward.org/recursion/print-1-to-n-using-recursion/", practice:"https://takeuforward.org/plus" },{ title:"Print N to 1 using recursion", yt:"https://youtu.be/un6PLygfXrA", article:"https://takeuforward.org/recursion/print-n-to-1-using-recursion/", practice:"https://takeuforward.org/plus" },{ title:"Sum of first N numbers", yt:"https://youtu.be/69ZCDFy-OUo", article:"https://takeuforward.org/recursion/sum-of-first-n-natural-numbers/", practice:"https://takeuforward.org/plus" },{ title:"Factorial of N numbers", yt:"https://youtu.be/69ZCDFy-OUo", article:"https://takeuforward.org/recursion/factorial-of-a-number-iterative-and-recursive/", practice:"https://takeuforward.org/plus" },{ title:"Reverse an array", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/data-structure/reverse-a-given-array/", practice:"https://leetcode.com/problems/reverse-string/", difficulty:"Easy" },{ title:"Check if a string is palindrome or not", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/data-structure/check-if-the-given-string-is-palindrome-or-not/", practice:"https://leetcode.com/problems/valid-palindrome/", difficulty:"Easy" },{ title:"Fibonacci Number", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/arrays/print-fibonacci-series-up-to-n-th-term/", practice:"https://leetcode.com/problems/fibonacci-number/", difficulty:"Easy" },{ title:"K-th Symbol in Grammar", practice:"https://leetcode.com/problems/k-th-symbol-in-grammar/", difficulty:"Medium" },{ title:"Letter Case Permutation", practice:"https://leetcode.com/problems/letter-case-permutation/", difficulty:"Medium" }
  ]},{ name:"Learn Basic Hashing", problems:[
      { title:"Counting frequencies of array elements", yt:"https://youtu.be/KEs5UyBJ39g", article:"https://takeuforward.org/data-structure/count-frequency-of-each-element-in-the-array/", practice:"https://takeuforward.org/plus" },{ title:"Find the highest/lowest frequency element", yt:"https://youtu.be/KEs5UyBJ39g", article:"https://takeuforward.org/arrays/find-the-highest-lowest-frequency-element/", practice:"https://takeuforward.org/plus" },{ title:"Contains Duplicate", practice:"https://leetcode.com/problems/contains-duplicate/", difficulty:"Easy" },{ title:"Ransom Note", practice:"https://leetcode.com/problems/ransom-note/", difficulty:"Easy" },{ title:"Word Pattern", practice:"https://leetcode.com/problems/word-pattern/", difficulty:"Easy" },{ title:"Group Anagrams", practice:"https://leetcode.com/problems/group-anagrams/", difficulty:"Medium" }
  ]}
]},{ step:2, title:"Learn Important Sorting Techniques", week:1, subtopics:[
  { name:"Sorting-I", problems:[
      { title:"Selection Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/selection-sort-algorithm/", practice:"https://takeuforward.org/plus" },{ title:"Bubble Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/bubble-sort-algorithm/", practice:"https://takeuforward.org/plus" },{ title:"Insertion Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/insertion-sort-algorithm/", practice:"https://takeuforward.org/plus" },{ title:"Sort Array by Parity", practice:"https://leetcode.com/problems/sort-array-by-parity/", difficulty:"Easy" },{ title:"Relative Sort Array", practice:"https://leetcode.com/problems/relative-sort-array/", difficulty:"Easy" },{ title:"Sort Array by Parity II", practice:"https://leetcode.com/problems/sort-array-by-parity-ii/", difficulty:"Easy" },{ title:"H-Index", practice:"https://leetcode.com/problems/h-index/", difficulty:"Medium" }
  ]},{ name:"Sorting-II", problems:[
      { title:"Merge Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/data-structure/merge-sort-algorithm/", practice:"https://leetcode.com/problems/sort-an-array/", difficulty:"Medium" },{ title:"Recursive Bubble Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/arrays/recursive-bubble-sort-algorithm/", practice:"https://takeuforward.org/plus" },{ title:"Recursive Insertion Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/arrays/recursive-insertion-sort-algorithm/", practice:"https://takeuforward.org/plus" },{ title:"Maximum Gap", practice:"https://leetcode.com/problems/maximum-gap/", difficulty:"Medium" },{ title:"Count of Range Sum", practice:"https://leetcode.com/problems/count-of-range-sum/", difficulty:"Hard" },{ title:"Sort Characters By Frequency", practice:"https://leetcode.com/problems/sort-characters-by-frequency/", difficulty:"Medium" }
  ]}
]},{ step:3, title:"Solve Problems on Arrays", week:2, subtopics:[
  { name:"Easy", problems:[
      { title:"Largest Element in Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/find-the-largest-element-in-an-array/", practice:"https://takeuforward.org/plus" },{ title:"Second Largest Element in Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/find-second-smallest-and-second-largest-element-in-an-array/", practice:"https://takeuforward.org/plus" },{ title:"Check if array is sorted", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/check-if-an-array-is-sorted/", practice:"https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/", difficulty:"Easy" },{ title:"Remove Duplicates from Sorted Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/remove-duplicates-in-place-from-sorted-array/", practice:"https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty:"Easy" },{ title:"Left Rotate the Array by One", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/left-rotate-the-array-by-one/", practice:"https://takeuforward.org/plus" },{ title:"Rotate array by K elements", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/rotate-array-by-k-elements/", practice:"https://leetcode.com/problems/rotate-array/", difficulty:"Medium" },{ title:"Move Zeroes to End", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/move-all-zeros-to-the-end-of-the-array/", practice:"https://leetcode.com/problems/move-zeroes/", difficulty:"Easy" },{ title:"Linear Search", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/linear-search-in-c/", practice:"https://takeuforward.org/plus" },{ title:"Union of Two Sorted Arrays", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/union-of-two-sorted-arrays/", practice:"https://takeuforward.org/plus" },{ title:"Find missing number in an array", yt:"https://youtu.be/581L8kC8A_E", article:"https://takeuforward.org/arrays/find-the-missing-number-in-an-array/", practice:"https://leetcode.com/problems/missing-number/", difficulty:"Easy" },{ title:"Maximum Consecutive Ones", yt:"https://youtu.be/bYWLJb3vCWY", article:"https://takeuforward.org/data-structure/count-maximum-consecutive-ones-in-the-array/", practice:"https://leetcode.com/problems/max-consecutive-ones/", difficulty:"Easy" },{ title:"Find the number that appears once", yt:"https://youtu.be/bYWLJb3vCWY", article:"https://takeuforward.org/arrays/find-the-number-that-appears-once-and-the-other-numbers-twice/", practice:"https://leetcode.com/problems/single-number/", difficulty:"Easy" },{ title:"Pascal's Triangle II", practice:"https://leetcode.com/problems/pascals-triangle-ii/", difficulty:"Easy" },{ title:"Running Sum of 1d Array", practice:"https://leetcode.com/problems/running-sum-of-1d-array/", difficulty:"Easy" },{ title:"Find Pivot Index", practice:"https://leetcode.com/problems/find-pivot-index/", difficulty:"Easy" },{ title:"Shuffle the Array", practice:"https://leetcode.com/problems/shuffle-the-array/", difficulty:"Easy" },{ title:"Find All Numbers Disappeared in an Array", practice:"https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/", difficulty:"Easy" },{ title:"Third Maximum Number", practice:"https://leetcode.com/problems/third-maximum-number/", difficulty:"Easy" }
  ]},{ name:"Medium", problems:[
      { title:"Two Sum", yt:"https://youtu.be/UXDSeD9mN-k", article:"https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", practice:"https://leetcode.com/problems/two-sum/", difficulty:"Easy" },{ title:"Sort Colors (Dutch Flag)", yt:"https://youtu.be/tp8JIuCXBaU", article:"https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/", practice:"https://leetcode.com/problems/sort-colors/", difficulty:"Medium" },{ title:"Majority Element (>N/2 times)", yt:"https://youtu.be/nP_ns3uSh80", article:"https://takeuforward.org/data-structure/find-the-majority-element-that-occurs-more-than-n-2-times/", practice:"https://leetcode.com/problems/majority-element/", difficulty:"Easy" },{ title:"Kadane's Algorithm – Max Subarray Sum", yt:"https://youtu.be/AHZpyENo7kM", article:"https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/", practice:"https://leetcode.com/problems/maximum-subarray/", difficulty:"Medium" },{ title:"Best Time to Buy and Sell Stock", yt:"https://youtu.be/ioFPBdChabY", article:"https://takeuforward.org/data-structure/stock-buy-and-sell/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty:"Easy" },{ title:"Rearrange Array Elements by Sign", yt:"https://youtu.be/h4aBagy4dhw", article:"https://takeuforward.org/data-structure/rearrange-array-elements-by-sign/", practice:"https://leetcode.com/problems/rearrange-array-elements-by-sign/", difficulty:"Medium" },{ title:"Next Permutation", yt:"https://youtu.be/JDOXKqF60RQ", article:"https://takeuforward.org/data-structure/next_permutation-find-next-lexicographically-greater-permutation/", practice:"https://leetcode.com/problems/next-permutation/", difficulty:"Medium" },{ title:"Leaders in an Array", yt:"https://youtu.be/cHrE-bPSzJE", article:"https://takeuforward.org/data-structure/leaders-in-an-array/", practice:"https://takeuforward.org/plus" },{ title:"Longest Consecutive Sequence", yt:"https://youtu.be/oO5uLE8zzDk", article:"https://takeuforward.org/data-structure/longest-consecutive-sequence-in-an-array/", practice:"https://leetcode.com/problems/longest-consecutive-sequence/", difficulty:"Medium" },{ title:"Set Matrix Zeroes", yt:"https://youtu.be/N0MgLvceX7M", article:"https://takeuforward.org/data-structure/set-matrix-zero/", practice:"https://leetcode.com/problems/set-matrix-zeroes/", difficulty:"Medium" },{ title:"Rotate Matrix 90 Degrees", yt:"https://youtu.be/Z0R2u6gd3GU", article:"https://takeuforward.org/data-structure/rotate-image-by-90-degree/", practice:"https://leetcode.com/problems/rotate-image/", difficulty:"Medium" },{ title:"Spiral Order Matrix", yt:"https://youtu.be/3Zv1bkPnOPQ", article:"https://takeuforward.org/data-structure/spiral-traversal-of-matrix/", practice:"https://leetcode.com/problems/spiral-matrix/", difficulty:"Medium" },{ title:"Subarray with Given Sum (Pos+Neg)", yt:"https://youtu.be/xvNwoz-ufXA", article:"https://takeuforward.org/data-structure/longest-subarray-with-sum-k/", practice:"https://leetcode.com/problems/subarray-sum-equals-k/", difficulty:"Medium" },{ title:"Product of Array Except Self", practice:"https://leetcode.com/problems/product-of-array-except-self/", difficulty:"Medium" },{ title:"Container With Most Water", practice:"https://leetcode.com/problems/container-with-most-water/", difficulty:"Medium" },{ title:"3Sum Closest", practice:"https://leetcode.com/problems/3sum-closest/", difficulty:"Medium" },{ title:"Find the Duplicate Number", practice:"https://leetcode.com/problems/find-the-duplicate-number/", difficulty:"Medium" }
  ]},{ name:"Hard", problems:[
      { title:"Pascal's Triangle", yt:"https://youtu.be/bR7mQgwQ_o8", article:"https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/", practice:"https://leetcode.com/problems/pascals-triangle/", difficulty:"Easy" },{ title:"Majority Element (>N/3 times)", yt:"https://youtu.be/vwZj1K0e9U8", article:"https://takeuforward.org/data-structure/majority-elements-n-3-times-find-the-elements-that-appears-more-than-n-3-times-in-the-array/", practice:"https://leetcode.com/problems/majority-element-ii/", difficulty:"Medium" },{ title:"3-Sum", yt:"https://youtu.be/onLoX6Nhvmg", article:"https://takeuforward.org/data-structure/3-sum-find-triplets-that-add-up-to-a-zero/", practice:"https://leetcode.com/problems/3sum/", difficulty:"Medium" },{ title:"4-Sum", yt:"https://youtu.be/eD95WRfh81c", article:"https://takeuforward.org/data-structure/4-sum-find-quads-that-add-up-to-a-target-value/", practice:"https://leetcode.com/problems/4sum/", difficulty:"Medium" },{ title:"Maximum Product Subarray", yt:"https://youtu.be/hnswaLJvr6g", article:"https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/", practice:"https://leetcode.com/problems/maximum-product-subarray/", difficulty:"Medium" },{ title:"Merge Overlapping Sub-intervals", yt:"https://youtu.be/IexN60k62jo", article:"https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/", practice:"https://leetcode.com/problems/merge-intervals/", difficulty:"Medium" },{ title:"Merge Two Sorted Arrays Without Extra Space", yt:"https://youtu.be/n7uwj04E0I4", article:"https://takeuforward.org/data-structure/merge-two-sorted-arrays-without-extra-space/", practice:"https://leetcode.com/problems/merge-sorted-array/", difficulty:"Easy" },{ title:"Find the Repeating and Missing Number", yt:"https://youtu.be/2D0D8HE6uak", article:"https://takeuforward.org/data-structure/find-the-repeating-and-missing-numbers/", practice:"https://takeuforward.org/plus" },{ title:"Count Inversions in Array (Merge Sort)", yt:"https://youtu.be/AseUmwVNaoY", article:"https://takeuforward.org/data-structure/count-inversions-in-an-array/", practice:"https://leetcode.com/problems/count-of-smaller-numbers-after-self/", difficulty:"Hard" },{ title:"Reverse Pairs (Merge Sort)", yt:"https://youtu.be/S6rsAlj_iB4", article:"https://takeuforward.org/data-structure/count-reverse-pairs/", practice:"https://leetcode.com/problems/reverse-pairs/", difficulty:"Hard" },{ title:"Maximum Sum Rectangle in Matrix", yt:"https://youtu.be/1jOeEwxTDow", article:"https://takeuforward.org/data-structure/maximum-sum-rectangle/", practice:"https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/", difficulty:"Hard" },{ title:"First Missing Positive", practice:"https://leetcode.com/problems/first-missing-positive/", difficulty:"Hard" },{ title:"Max Value of Equation", practice:"https://leetcode.com/problems/max-value-of-equation/", difficulty:"Hard" }
  ]}
]},{ step:4, title:"Binary Search [1D, 2D Arrays, Search Space]", week:3, subtopics:[
  { name:"BS on 1D Arrays", problems:[
      { title:"Binary Search Introduction", yt:"https://youtu.be/W9QJ8HaRvJQ", article:"https://takeuforward.org/data-structure/binary-search-explained/", practice:"https://leetcode.com/problems/binary-search/", difficulty:"Easy" },{ title:"Implement Lower Bound", yt:"https://youtu.be/6zhGS79oQ4k", article:"https://takeuforward.org/data-structure/implement-lower-bound/", practice:"https://leetcode.com/problems/search-insert-position/", difficulty:"Easy" },{ title:"Floor and Ceil in Sorted Array", yt:"https://youtu.be/6zhGS79oQ4k", article:"https://takeuforward.org/data-structure/floor-and-ceil-in-sorted-array/", practice:"https://takeuforward.org/plus" },{ title:"First and Last Occurrence of X", yt:"https://youtu.be/hjR1IYVx9lY", article:"https://takeuforward.org/data-structure/last-occurrence-in-a-sorted-array/", practice:"https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", difficulty:"Medium" },{ title:"Count Occurrences in Sorted Array", yt:"https://youtu.be/hjR1IYVx9lY", article:"https://takeuforward.org/data-structure/count-occurrences-in-sorted-array/", practice:"https://takeuforward.org/plus" },{ title:"Search in Rotated Sorted Array I", yt:"https://youtu.be/5qGrJbHhqFs", article:"https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array/", practice:"https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty:"Medium" },{ title:"Search in Rotated Sorted Array II (Duplicates)", yt:"https://youtu.be/w2G2W8l__pc", article:"https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array-ii/", practice:"https://leetcode.com/problems/search-in-rotated-sorted-array-ii/", difficulty:"Medium" },{ title:"Minimum in Rotated Sorted Array", yt:"https://youtu.be/Ril1tCeB1wU", article:"https://takeuforward.org/data-structure/minimum-element-in-a-rotated-sorted-array/", practice:"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty:"Medium" },{ title:"Single Element in a Sorted Array", yt:"https://youtu.be/l1ED7bG5nP0", article:"https://takeuforward.org/data-structure/single-element-in-a-sorted-array/", practice:"https://leetcode.com/problems/single-element-in-a-sorted-array/", difficulty:"Medium" },{ title:"Find Peak Element", yt:"https://youtu.be/cXxmbemS6XM", article:"https://takeuforward.org/data-structure/peak-element-in-array/", practice:"https://leetcode.com/problems/find-peak-element/", difficulty:"Medium" },{ title:"Guess Number Higher or Lower", practice:"https://leetcode.com/problems/guess-number-higher-or-lower/", difficulty:"Easy" },{ title:"First Bad Version", practice:"https://leetcode.com/problems/first-bad-version/", difficulty:"Easy" },{ title:"Find Minimum in Rotated Sorted Array II", practice:"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/", difficulty:"Hard" },{ title:"Count Occurrences of Element in Sorted Array", practice:"https://leetcode.com/problems/count-occurrences-in-array/" },{ title:"Peak Index in a Mountain Array", practice:"https://leetcode.com/problems/peak-index-in-a-mountain-array/", difficulty:"Medium" }
  ]},{ name:"BS on Answers", problems:[
      { title:"Find Sqrt of a Number", yt:"https://youtu.be/Bsv3FPUX_BA", article:"https://takeuforward.org/binary-search/finding-sqrt-of-a-number-using-binary-search/", practice:"https://leetcode.com/problems/sqrtx/", difficulty:"Easy" },{ title:"Find the Nth Root of a Number", yt:"https://youtu.be/WjpswYrS2nY", article:"https://takeuforward.org/data-structure/find-nth-root-of-m/", practice:"https://takeuforward.org/plus" },{ title:"Koko Eating Bananas", yt:"https://youtu.be/qyfekrNni90", article:"https://takeuforward.org/binary-search/koko-eating-bananas/", practice:"https://leetcode.com/problems/koko-eating-bananas/", difficulty:"Medium" },{ title:"Minimum Days to Make M Bouquets", yt:"https://youtu.be/TXAuxeYBTdg", article:"https://takeuforward.org/binary-search/minimum-days-to-make-m-bouquets/", practice:"https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/", difficulty:"Medium" },{ title:"Find the Smallest Divisor", yt:"https://youtu.be/UvTMuf1LD5k", article:"https://takeuforward.org/binary-search/find-the-smallest-divisor-given-a-threshold/", practice:"https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/", difficulty:"Medium" },{ title:"Capacity to Ship Packages", yt:"https://youtu.be/s1YMbOVdZ8s", article:"https://takeuforward.org/binary-search/capacity-to-ship-packages-within-d-days/", practice:"https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", difficulty:"Medium" },{ title:"Aggressive Cows", yt:"https://youtu.be/R_Mfw4ew-Vo", article:"https://takeuforward.org/data-structure/aggressive-cows-detailed-solution/", practice:"https://www.spoj.com/problems/AGGRCOWS/" },{ title:"Book Allocation Problem", yt:"https://youtu.be/Z0hwjftStI4", article:"https://takeuforward.org/data-structure/allocate-minimum-number-of-pages/", practice:"https://leetcode.com/problems/allocate-books/" },{ title:"Split Array – Largest Sum", yt:"https://youtu.be/thUd_WJn6wk", article:"https://takeuforward.org/arrays/split-array-largest-sum/", practice:"https://leetcode.com/problems/split-array-largest-sum/", difficulty:"Hard" },{ title:"Painter's Partition Problem", yt:"https://youtu.be/thUd_WJn6wk", article:"https://takeuforward.org/data-structure/painters-partition-problem/", practice:"https://www.interviewbit.com/problems/painters-partition-problem/" },{ title:"Minimize Max Distance between Gas Stations", yt:"https://youtu.be/kpas4GjFRfY", article:"https://takeuforward.org/data-structure/minimise-maximum-distance-between-petrol-pumps/", practice:"https://leetcode.com/problems/minimize-max-distance-to-gas-station/", difficulty:"Hard" },{ title:"Median of Two Sorted Arrays", yt:"https://youtu.be/C2rRzz-JDk8", article:"https://takeuforward.org/data-structure/median-of-two-sorted-arrays-of-different-sizes/", practice:"https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty:"Hard" },{ title:"Kth Element of Two Sorted Arrays", yt:"https://youtu.be/q13SLMwVTi4", article:"https://takeuforward.org/data-structure/k-th-element-of-two-sorted-arrays/", practice:"https://takeuforward.org/plus" },{ title:"Minimum Speed to Arrive on Time", practice:"https://leetcode.com/problems/minimum-speed-to-arrive-on-time/", difficulty:"Medium" },{ title:"Path With Minimum Effort", practice:"https://leetcode.com/problems/path-with-minimum-effort/", difficulty:"Medium" },{ title:"Cutting Ribbons", practice:"https://leetcode.com/problems/cutting-ribbons/", difficulty:"Medium" },{ title:"Maximum Candies Allocated to K Children", practice:"https://leetcode.com/problems/maximum-candies-allocated-to-k-children/", difficulty:"Medium" },{ title:"Magnetic Force Between Two Balls", practice:"https://leetcode.com/problems/magnetic-force-between-two-balls/", difficulty:"Medium" }
  ]},{ name:"BS on 2D Arrays", problems:[
      { title:"Row with Maximum 1s", yt:"https://youtu.be/SCz-1TtYxDI", article:"https://takeuforward.org/data-structure/row-with-maximum-1s/", practice:"https://leetcode.com/problems/row-with-maximum-ones/", difficulty:"Easy" },{ title:"Search in a 2D Matrix", yt:"https://youtu.be/JXU4Akft7yk", article:"https://takeuforward.org/data-structure/search-in-a-2d-matrix/", practice:"https://leetcode.com/problems/search-a-2d-matrix/", difficulty:"Medium" },{ title:"Search in a 2D Matrix II", yt:"https://youtu.be/9ZbB397jU4k", article:"https://takeuforward.org/data-structure/search-in-a-sorted-2d-matrix/", practice:"https://leetcode.com/problems/search-a-2d-matrix-ii/", difficulty:"Medium" },{ title:"Find Peak Element in 2D Matrix", yt:"https://youtu.be/oRhOUq6CfhI", article:"https://takeuforward.org/data-structure/find-peak-element-in-2d-grid/", practice:"https://leetcode.com/problems/find-a-peak-element-ii/", difficulty:"Medium" },{ title:"Median in a Row-Wise Sorted Matrix", yt:"https://youtu.be/63fPPOdIr2c", article:"https://takeuforward.org/data-structure/median-of-row-wise-sorted-matrix/", practice:"https://www.interviewbit.com/problems/median-of-array/" },{ title:"Count Negative Numbers in a Sorted Matrix", practice:"https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/", difficulty:"Easy" },{ title:"Kth Smallest Element in a Sorted Matrix", practice:"https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", difficulty:"Medium" }
  ]}
]},{ step:5, title:"Strings [Basic and Medium]", week:3, subtopics:[
  { name:"Basic String Problems", problems:[
      { title:"Remove Outermost Parentheses", yt:"https://youtu.be/RXGkNQGFHgE", article:"https://takeuforward.org/data-structure/remove-outermost-parentheses/", practice:"https://leetcode.com/problems/remove-outermost-parentheses/", difficulty:"Easy" },{ title:"Reverse Words in a String", yt:"https://youtu.be/AEgkh-nI8jQ", article:"https://takeuforward.org/data-structure/reverse-words-in-a-string/", practice:"https://leetcode.com/problems/reverse-words-in-a-string/", difficulty:"Medium" },{ title:"Largest Odd Number in a String", yt:"https://youtu.be/vk-bNDp58X4", article:"https://takeuforward.org/data-structure/largest-odd-number-in-a-string/", practice:"https://leetcode.com/problems/largest-odd-number-in-string/", difficulty:"Easy" },{ title:"Longest Common Prefix", yt:"https://youtu.be/x1UcklEMfSc", article:"https://takeuforward.org/data-structure/longest-common-prefix/", practice:"https://leetcode.com/problems/longest-common-prefix/", difficulty:"Easy" },{ title:"Isomorphic Strings", yt:"https://youtu.be/mMonZHVNwgk", article:"https://takeuforward.org/data-structure/check-if-two-strings-are-isomorphic/", practice:"https://leetcode.com/problems/isomorphic-strings/", difficulty:"Easy" },{ title:"Check if Strings are Rotations", yt:"https://youtu.be/7I9KN3PVHUY", article:"https://takeuforward.org/data-structure/check-if-string-is-rotation-of-another-string/", practice:"https://leetcode.com/problems/rotate-string/", difficulty:"Easy" },{ title:"Check if String is Anagram", yt:"https://youtu.be/eXgzuKTCCio", article:"https://takeuforward.org/data-structure/check-whether-two-strings-are-anagram-of-each-other/", practice:"https://leetcode.com/problems/valid-anagram/", difficulty:"Easy" },{ title:"Length of Last Word", practice:"https://leetcode.com/problems/length-of-last-word/", difficulty:"Easy" },{ title:"Defanging an IP Address", practice:"https://leetcode.com/problems/defanging-an-ip-address/", difficulty:"Easy" },{ title:"Greatest Common Divisor of Strings", practice:"https://leetcode.com/problems/greatest-common-divisor-of-strings/", difficulty:"Easy" },{ title:"Excel Sheet Column Title", practice:"https://leetcode.com/problems/excel-sheet-column-title/", difficulty:"Easy" },{ title:"Excel Sheet Column Number", practice:"https://leetcode.com/problems/excel-sheet-column-number/", difficulty:"Easy" },{ title:"Merge Strings Alternately", practice:"https://leetcode.com/problems/merge-strings-alternately/", difficulty:"Easy" }
  ]},{ name:"Medium String Problems", problems:[
      { title:"Sum of Beauty of All Substrings", yt:"https://youtu.be/vFZTxvUkNlk", article:"https://takeuforward.org/data-structure/sum-of-beauty-of-all-substrings/", practice:"https://leetcode.com/problems/sum-of-beauty-of-all-substrings/", difficulty:"Medium" },{ title:"Minimum Characters to Make String Palindrome", yt:"https://youtu.be/eXyniy96SiU", article:"https://takeuforward.org/data-structure/minimum-characters-for-palindrome/", practice:"https://takeuforward.org/plus" },{ title:"Valid Palindrome II", yt:"https://youtu.be/JrxobOHMEhU", article:"https://takeuforward.org/data-structure/valid-palindrome-ii/", practice:"https://leetcode.com/problems/valid-palindrome-ii/", difficulty:"Easy" },{ title:"Longest Palindromic Substring", yt:"https://youtu.be/XYQecbcd6_c", article:"https://takeuforward.org/data-structure/longest-palindromic-substring/", practice:"https://leetcode.com/problems/longest-palindromic-substring/", difficulty:"Medium" },{ title:"Roman to Integer", yt:"https://youtu.be/IFSMc_cAaTc", article:"https://takeuforward.org/data-structure/roman-number-to-integer-and-vice-versa/", practice:"https://leetcode.com/problems/roman-to-integer/", difficulty:"Easy" },{ title:"Integer to Roman", yt:"https://youtu.be/ZMLKhYvJNd4", article:"https://takeuforward.org/data-structure/integer-to-roman/", practice:"https://leetcode.com/problems/integer-to-roman/", difficulty:"Medium" },{ title:"String to Integer (atoi)", yt:"https://youtu.be/n3Jj4Jg4yne", article:"https://takeuforward.org/data-structure/implement-atoi/", practice:"https://leetcode.com/problems/string-to-integer-atoi/", difficulty:"Medium" },{ title:"Count and Say", yt:"https://youtu.be/8I1lHEHFr0E", article:"https://takeuforward.org/data-structure/count-and-say/", practice:"https://leetcode.com/problems/count-and-say/", difficulty:"Medium" },{ title:"Implement strStr (KMP Algorithm)", yt:"https://youtu.be/JoF0Z7nVSrA", article:"https://takeuforward.org/data-structure/kmp-algorithm/", practice:"https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", difficulty:"Easy" },{ title:"Repeated String Match", yt:"https://youtu.be/fOOiHWw10XQ", article:"https://takeuforward.org/data-structure/repeated-string-match/", practice:"https://leetcode.com/problems/repeated-string-match/", difficulty:"Medium" },{ title:"Zigzag Conversion", practice:"https://leetcode.com/problems/zigzag-conversion/", difficulty:"Medium" },{ title:"Decode Ways", practice:"https://leetcode.com/problems/decode-ways/", difficulty:"Medium" },{ title:"Simplify Path", practice:"https://leetcode.com/problems/simplify-path/", difficulty:"Medium" },{ title:"Basic Calculator II", practice:"https://leetcode.com/problems/basic-calculator-ii/", difficulty:"Medium" },{ title:"Decode String", practice:"https://leetcode.com/problems/decode-string/", difficulty:"Medium" },{ title:"Find All Anagrams in a String", practice:"https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty:"Medium" },{ title:"Multiply Strings", practice:"https://leetcode.com/problems/multiply-strings/", difficulty:"Medium" }
  ]}
]},{ step:6, title:"Learn LinkedList [Single LL, Double LL, Medium, Hard, FAQs]", week:4, subtopics:[
  { name:"Learn Single Linked List", problems:[
      { title:"Introduction to Linked List", yt:"https://youtu.be/Nq7ok-OyEpg", article:"https://takeuforward.org/linked-list/introduction-to-linked-list/", practice:"https://leetcode.com/problems/design-linked-list/", difficulty:"Medium" },{ title:"Delete Node in Linked List", yt:"https://youtu.be/QHvoZsCROpQ", article:"https://takeuforward.org/data-structure/delete-last-node-of-linked-list/", practice:"https://leetcode.com/problems/delete-node-in-a-linked-list/", difficulty:"Medium" },{ title:"Search in Linked List", yt:"https://youtu.be/W_CPMDsRDEU", article:"https://takeuforward.org/linked-list/search-an-element-in-linked-list/", practice:"https://takeuforward.org/plus" },{ title:"Convert Binary Number in a Linked List to Integer", practice:"https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-an-integer/" }
  ]},{ name:"Learn Doubly Linked List", problems:[
      { title:"Reverse a DLL", yt:"https://youtu.be/BJHpDc9c8pc", article:"https://takeuforward.org/data-structure/reverse-a-doubly-linked-list/", practice:"https://takeuforward.org/plus" },{ title:"Flatten a Multilevel Doubly Linked List", practice:"https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/", difficulty:"Medium" },{ title:"Design Browser History", practice:"https://leetcode.com/problems/design-browser-history/", difficulty:"Medium" }
  ]},{ name:"Medium Problems on LL", problems:[
      { title:"Middle of the Linked List", yt:"https://youtu.be/G0_I-ZF0S38", article:"https://takeuforward.org/data-structure/find-middle-element-in-a-linked-list/", practice:"https://leetcode.com/problems/middle-of-the-linked-list/", difficulty:"Easy" },{ title:"Reverse a Linked List", yt:"https://youtu.be/Mu_aCxnS2_8", article:"https://takeuforward.org/data-structure/reverse-a-linked-list/", practice:"https://leetcode.com/problems/reverse-linked-list/", difficulty:"Easy" },{ title:"Detect a Loop in LL (Floyd's Algorithm)", yt:"https://youtu.be/6BsBjpt9pCU", article:"https://takeuforward.org/data-structure/detect-a-cycle-in-a-linked-list/", practice:"https://leetcode.com/problems/linked-list-cycle/", difficulty:"Easy" },{ title:"Find Starting Point of Loop in LL", yt:"https://youtu.be/QfbstLVErp4", article:"https://takeuforward.org/data-structure/starting-point-of-loop-in-a-linked-list/", practice:"https://leetcode.com/problems/linked-list-cycle-ii/", difficulty:"Medium" },{ title:"Check Palindrome in LL", yt:"https://youtu.be/lRY_G-u_8jk", article:"https://takeuforward.org/data-structure/check-if-linked-list-is-palindrome/", practice:"https://leetcode.com/problems/palindrome-linked-list/", difficulty:"Easy" },{ title:"Segregate Odd and Even Nodes", yt:"https://youtu.be/qf6qp7GzD5Q", article:"https://takeuforward.org/data-structure/segregate-odd-and-even-nodes-in-linked-list/", practice:"https://leetcode.com/problems/odd-even-linked-list/", difficulty:"Medium" },{ title:"Remove Nth Node from End", yt:"https://youtu.be/AdnBqyBBLvs", article:"https://takeuforward.org/data-structure/remove-nth-node-from-the-back-of-the-linked-list/", practice:"https://leetcode.com/problems/remove-nth-node-from-end-of-list/", difficulty:"Medium" },{ title:"Delete the Middle Node", yt:"https://youtu.be/ePaUbEPITuw", article:"https://takeuforward.org/data-structure/delete-the-middle-node-of-linked-list/", practice:"https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/", difficulty:"Medium" },{ title:"Sort LL using Merge Sort", yt:"https://youtu.be/8ocB7a_c-Cc", article:"https://takeuforward.org/data-structure/sort-linked-list/", practice:"https://leetcode.com/problems/sort-list/", difficulty:"Medium" },{ title:"Sort 0s, 1s, 2s in LL", yt:"https://youtu.be/gRII7LhdJWc", article:"https://takeuforward.org/data-structure/sort-linked-list-of-0s-1s-2s/", practice:"https://takeuforward.org/plus" },{ title:"Find the Intersection Point of Y LL", yt:"https://youtu.be/0DYoPz2Tpt4", article:"https://takeuforward.org/data-structure/find-intersection-of-two-linked-lists/", practice:"https://leetcode.com/problems/intersection-of-two-linked-lists/", difficulty:"Easy" },{ title:"Add 1 to a Number Represented by LL", yt:"https://youtu.be/aXQWhbvT3w0", article:"https://takeuforward.org/data-structure/add-1-to-a-number-represented-as-linked-list/", practice:"https://takeuforward.org/plus" },{ title:"Swap Nodes in Pairs", practice:"https://leetcode.com/problems/swap-nodes-in-pairs/", difficulty:"Medium" },{ title:"Remove Duplicates from Sorted List II", practice:"https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/", difficulty:"Medium" },{ title:"Partition List", practice:"https://leetcode.com/problems/partition-list/", difficulty:"Medium" }
  ]},{ name:"Hard Problems on LL", problems:[
      { title:"Reverse LL in Groups of K", yt:"https://youtu.be/lIar1skcQYI", article:"https://takeuforward.org/data-structure/reverse-linked-list-in-groups-of-size-k/", practice:"https://leetcode.com/problems/reverse-nodes-in-k-group/", difficulty:"Hard" },{ title:"Rotate a Linked List", yt:"https://youtu.be/9VPm6nEbVPA", article:"https://takeuforward.org/data-structure/rotate-a-linked-list/", practice:"https://leetcode.com/problems/rotate-list/", difficulty:"Medium" },{ title:"Flattening a Linked List", yt:"https://youtu.be/ysytSSXpAI0", article:"https://takeuforward.org/data-structure/flattening-a-linked-list/", practice:"https://takeuforward.org/plus" },{ title:"Clone LL with Random Pointers", yt:"https://youtu.be/VNf6VynfpdM", article:"https://takeuforward.org/data-structure/clone-linked-list-with-random-and-next-pointer/", practice:"https://leetcode.com/problems/copy-list-with-random-pointer/", difficulty:"Medium" },{ title:"Add Two Numbers (LL)", yt:"https://youtu.be/XmRrGzR6udg", article:"https://takeuforward.org/data-structure/add-two-numbers-represented-as-linked-lists/", practice:"https://leetcode.com/problems/add-two-numbers/", difficulty:"Medium" },{ title:"Merge Two Sorted LLs", yt:"https://youtu.be/jXu-H7XuClE", article:"https://takeuforward.org/data-structure/merge-two-sorted-linked-lists/", practice:"https://leetcode.com/problems/merge-two-sorted-lists/", difficulty:"Easy" },{ title:"Merge K Sorted Lists", yt:"https://youtu.be/1zln14-CTMI", article:"https://takeuforward.org/data-structure/merge-k-sorted-lists/", practice:"https://leetcode.com/problems/merge-k-sorted-lists/", difficulty:"Hard" },{ title:"LFU Cache", practice:"https://leetcode.com/problems/lfu-cache/", difficulty:"Hard" }
  ]}
]},{ step:7, title:"Recursion [PatternWise]", week:4, subtopics:[
  { name:"Get a Strong Hold on Recursion", problems:[
      { title:"Pow(x,n) – Power Function", yt:"https://youtu.be/l0YC3876qxg", article:"https://takeuforward.org/recursion/learn-all-patterns-of-recursion/", practice:"https://leetcode.com/problems/powx-n/", difficulty:"Medium" },{ title:"Count Good Numbers", yt:"https://youtu.be/l0YC3876qxg", article:"https://takeuforward.org/data-structure/count-good-numbers/", practice:"https://leetcode.com/problems/count-good-numbers/", difficulty:"Medium" },{ title:"Sort Stack Using Recursion", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/recursion/sort-a-stack-using-recursion/", practice:"https://takeuforward.org/plus" },{ title:"Reverse a Stack Using Recursion", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/recursion/reverse-a-stack-using-recursion/", practice:"https://takeuforward.org/plus" },{ title:"Different Ways to Add Parentheses", practice:"https://leetcode.com/problems/different-ways-to-add-parentheses/", difficulty:"Medium" }
  ]},{ name:"Subsequences Pattern", problems:[
      { title:"Subset Sums – Generate All Subset Sums", yt:"https://youtu.be/eFdBODYNUPY", article:"https://takeuforward.org/data-structure/subset-sum-sum-of-all-subsets/", practice:"https://takeuforward.org/plus" },{ title:"Subset Sum II – Unique Subsets", yt:"https://youtu.be/RIn3gOkbhQE", article:"https://takeuforward.org/data-structure/subset-ii-print-all-the-unique-subsets/", practice:"https://leetcode.com/problems/subsets-ii/", difficulty:"Medium" },{ title:"Combination Sum I", yt:"https://youtu.be/kvWNHKNv3AQ", article:"https://takeuforward.org/data-structure/combination-sum-1/", practice:"https://leetcode.com/problems/combination-sum/", difficulty:"Medium" },{ title:"Combination Sum II", yt:"https://youtu.be/OyZFFqQtu98", article:"https://takeuforward.org/data-structure/combination-sum-ii-find-all-unique-combinations/", practice:"https://leetcode.com/problems/combination-sum-ii/", difficulty:"Medium" },{ title:"Combination Sum III", yt:"https://youtu.be/f2ic2Rsc9pU", article:"https://takeuforward.org/data-structure/combination-sum-iii/", practice:"https://leetcode.com/problems/combination-sum-iii/", difficulty:"Medium" },{ title:"Letter Combinations of Phone Number", yt:"https://youtu.be/NA2Oj9xqaZQ", article:"https://takeuforward.org/data-structure/letter-combinations-of-a-phone-number/", practice:"https://leetcode.com/problems/letter-combinations-of-a-phone-number/", difficulty:"Medium" },{ title:"Palindrome Partitioning", yt:"https://youtu.be/N_cBL7hT7xM", article:"https://takeuforward.org/data-structure/palindrome-partitioning/", practice:"https://leetcode.com/problems/palindrome-partitioning/", difficulty:"Medium" },{ title:"Word Search", yt:"https://youtu.be/m9TrOL1ETxI", article:"https://takeuforward.org/data-structure/word-search/", practice:"https://leetcode.com/problems/word-search/", difficulty:"Medium" },{ title:"Non-decreasing Subsequences", practice:"https://leetcode.com/problems/non-decreasing-subsequences/", difficulty:"Medium" }
  ]},{ name:"Trying out all Combos / Hard", problems:[
      { title:"Permutations I (Extra Array)", yt:"https://youtu.be/YK78FU5Ffjw", article:"https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/", practice:"https://leetcode.com/problems/permutations/", difficulty:"Medium" },{ title:"Permutations II (No Extra Array)", yt:"https://youtu.be/f2ic2Rsc9pU", article:"https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/", practice:"https://leetcode.com/problems/permutations-ii/", difficulty:"Medium" },{ title:"N Queens", yt:"https://youtu.be/i05Ju7AftcM", article:"https://takeuforward.org/data-structure/n-queen-problem-return-all-distinct-solutions-to-the-n-queens-puzzle/", practice:"https://leetcode.com/problems/n-queens/", difficulty:"Hard" },{ title:"Rat in a Maze", yt:"https://youtu.be/bLGZhJlt4y0", article:"https://takeuforward.org/data-structure/rat-in-a-maze/", practice:"https://takeuforward.org/plus" },{ title:"Sudoku Solver", yt:"https://youtu.be/FWAIf_EVUKE", article:"https://takeuforward.org/data-structure/sudoku-solver/", practice:"https://leetcode.com/problems/sudoku-solver/", difficulty:"Hard" },{ title:"M Coloring Problem", yt:"https://youtu.be/wuVwUK25Rfc", article:"https://takeuforward.org/data-structure/m-coloring-problem/", practice:"https://takeuforward.org/plus" },{ title:"Expression Add Operators", yt:"https://youtu.be/nV9OkLW-OvI", article:"https://takeuforward.org/data-structure/expression-add-operators/", practice:"https://leetcode.com/problems/expression-add-operators/", difficulty:"Hard" },{ title:"Generate Parentheses", yt:"https://youtu.be/zuRQElJ6CwY", article:"https://takeuforward.org/data-structure/generate-parentheses/", practice:"https://leetcode.com/problems/generate-parentheses/", difficulty:"Medium" },{ title:"Remove Boxes", practice:"https://leetcode.com/problems/remove-boxes/", difficulty:"Hard" },{ title:"Zuma Game", practice:"https://leetcode.com/problems/zuma-game/", difficulty:"Hard" },{ title:"Beautiful Arrangement", practice:"https://leetcode.com/problems/beautiful-arrangement/", difficulty:"Medium" }
  ]}
]},{ step:8, title:"Bit Manipulation [Concepts & Problems]", week:5, subtopics:[
  { name:"Learn Bit Manipulation", problems:[
      { title:"Introduction to Bit Manipulation", yt:"https://youtu.be/5rtVTYAk9KQ", article:"https://takeuforward.org/data-structure/bit-manipulation-course/", practice:"https://takeuforward.org/plus" },{ title:"Check if i-th bit is set or not", yt:"https://youtu.be/5rtVTYAk9KQ", article:"https://takeuforward.org/bit-manipulation/check-if-ith-bit-is-set-or-not/", practice:"https://takeuforward.org/plus" },{ title:"Count Set Bits (Brian Kernighan)", yt:"https://youtu.be/XxtmitBozAA", article:"https://takeuforward.org/bit-manipulation/count-number-of-set-bits/", practice:"https://leetcode.com/problems/number-of-1-bits/", difficulty:"Easy" },{ title:"Check Power of 2", yt:"https://youtu.be/SXrTi7xF30o", article:"https://takeuforward.org/bit-manipulation/check-whether-the-number-is-power-of-2/", practice:"https://leetcode.com/problems/power-of-two/", difficulty:"Easy" },{ title:"Minimum Bit Flips to Convert Number", yt:"https://youtu.be/ZwU6wSkepBI", article:"https://takeuforward.org/bit-manipulation/minimum-bit-flips-to-convert-number/", practice:"https://leetcode.com/problems/minimum-bit-flips-to-convert-number/", difficulty:"Easy" },{ title:"Reverse Bits", yt:"https://youtu.be/QuHxMJV_tcg", article:"https://takeuforward.org/bit-manipulation/reverse-bits/", practice:"https://leetcode.com/problems/reverse-bits/", difficulty:"Easy" },{ title:"Counting Bits", practice:"https://leetcode.com/problems/counting-bits/", difficulty:"Easy" },{ title:"Bitwise AND of Numbers Range", practice:"https://leetcode.com/problems/bitwise-and-of-numbers-range/", difficulty:"Medium" },{ title:"Integer Replacement", practice:"https://leetcode.com/problems/integer-replacement/", difficulty:"Medium" },{ title:"Sum of Two Integers", practice:"https://leetcode.com/problems/sum-of-two-integers/", difficulty:"Medium" },{ title:"Find the Difference", practice:"https://leetcode.com/problems/find-the-difference/", difficulty:"Easy" }
  ]},{ name:"Interview Problems", problems:[
      { title:"Find the two Non-Repeating Numbers (XOR)", yt:"https://youtu.be/jU07z14VIfs", article:"https://takeuforward.org/bit-manipulation/two-numbers-with-odd-occurrences/", practice:"https://leetcode.com/problems/single-number-iii/", difficulty:"Medium" },{ title:"XOR of Numbers in Range [L, R]", yt:"https://youtu.be/EgI_P01P5-c", article:"https://takeuforward.org/bit-manipulation/xor-of-all-numbers-in-the-range/", practice:"https://takeuforward.org/plus" },{ title:"Divide Two Integers Without / or *", yt:"https://youtu.be/5hHwnSPiMIs", article:"https://takeuforward.org/bit-manipulation/divide-two-integers-without-using-multiplication-division-and-mod-operator/", practice:"https://leetcode.com/problems/divide-two-integers/", difficulty:"Medium" },{ title:"Maximum XOR of Two Numbers in Array", yt:"https://youtu.be/BTf05gs_8iU", article:"https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/", practice:"https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/", difficulty:"Medium" },{ title:"All Subsets Using Bit Masking", yt:"https://youtu.be/tnSi6synbgM", article:"https://takeuforward.org/bit-manipulation/all-subsets-using-bit-masking/", practice:"https://leetcode.com/problems/subsets/", difficulty:"Medium" },{ title:"Count Total Set Bits 1 to N", yt:"https://youtu.be/g_hIx4yn_zg", article:"https://takeuforward.org/bit-manipulation/count-total-set-bits/", practice:"https://takeuforward.org/plus" },{ title:"Total Hamming Distance", practice:"https://leetcode.com/problems/total-hamming-distance/", difficulty:"Medium" },{ title:"UTF-8 Validation", practice:"https://leetcode.com/problems/utf-8-validation/", difficulty:"Medium" },{ title:"Decode XORed Array", practice:"https://leetcode.com/problems/decode-xored-array/", difficulty:"Easy" },{ title:"Find XOR Sum of All Pairs Bitwise AND", practice:"https://leetcode.com/problems/find-xor-sum-of-all-pairs-bitwise-and/", difficulty:"Hard" }
  ]}
]},{ step:9, title:"Stack and Queues [Learning, Pre-In-Post-fix, Monotonic]", week:5, subtopics:[
  { name:"Learning", problems:[
      { title:"Stack using Array", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/data-structure/implement-stack-using-array/", practice:"https://leetcode.com/problems/min-stack/", difficulty:"Medium" },{ title:"Stack using Linked List", yt:"https://youtu.be/GYptUgnIM_I", article:"https://takeuforward.org/data-structure/implement-stack-using-linked-list/", practice:"https://takeuforward.org/plus" },{ title:"Queue using Array", yt:"https://youtu.be/REOH22Xwdkk", article:"https://takeuforward.org/data-structure/implement-queue-using-array/", practice:"https://leetcode.com/problems/design-circular-queue/", difficulty:"Medium" },{ title:"Queue using Stack", yt:"https://youtu.be/3Et9MrMc02A", article:"https://takeuforward.org/data-structure/queue-using-stack/", practice:"https://leetcode.com/problems/implement-queue-using-stacks/", difficulty:"Easy" },{ title:"Stack using Queue", yt:"https://youtu.be/jDZQKzEtbYQ", article:"https://takeuforward.org/data-structure/stack-using-queue/", practice:"https://leetcode.com/problems/implement-stack-using-queues/", difficulty:"Easy" },{ title:"Valid Parentheses", yt:"https://youtu.be/HVJ3DHTPhuI", article:"https://takeuforward.org/data-structure/valid-parentheses/", practice:"https://leetcode.com/problems/valid-parentheses/", difficulty:"Easy" },{ title:"Baseball Game", practice:"https://leetcode.com/problems/baseball-game/", difficulty:"Easy" },{ title:"Backspace String Compare", practice:"https://leetcode.com/problems/backspace-string-compare/", difficulty:"Easy" },{ title:"Remove All Adjacent Duplicates In String", practice:"https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/", difficulty:"Easy" }
  ]},{ name:"Prefix, Infix, Postfix Conversions", problems:[
      { title:"Infix to Postfix Conversion", yt:"https://youtu.be/aN0VB5eRLno", article:"https://takeuforward.org/data-structure/infix-to-postfix-conversion/", practice:"https://takeuforward.org/plus" },{ title:"Prefix to Infix Conversion", yt:"https://youtu.be/dplYC2F7OJA", article:"https://takeuforward.org/data-structure/prefix-to-infix-conversion/", practice:"https://takeuforward.org/plus" },{ title:"Postfix Evaluation", yt:"https://youtu.be/IFOSCqbxL6E", article:"https://takeuforward.org/data-structure/postfix-evaluation/", practice:"https://leetcode.com/problems/evaluate-reverse-polish-notation/", difficulty:"Medium" },{ title:"Basic Calculator", practice:"https://leetcode.com/problems/basic-calculator/", difficulty:"Hard" }
  ]},{ name:"Monotonic Stack / Queue", problems:[
      { title:"Next Greater Element I", yt:"https://youtu.be/Dq_ObZwTY_Q", article:"https://takeuforward.org/data-structure/next-greater-element/", practice:"https://leetcode.com/problems/next-greater-element-i/", difficulty:"Easy" },{ title:"Next Greater Element II (Circular)", yt:"https://youtu.be/Du881K7Jtk8", article:"https://takeuforward.org/data-structure/next-greater-element-using-stack/", practice:"https://leetcode.com/problems/next-greater-element-ii/", difficulty:"Medium" },{ title:"Next Smaller Element", yt:"https://youtu.be/eXyniy96SiU", article:"https://takeuforward.org/data-structure/next-smaller-element/", practice:"https://takeuforward.org/plus" },{ title:"Trapping Rain Water", yt:"https://youtu.be/m18Hntz4go8", article:"https://takeuforward.org/data-structure/trapping-rainwater/", practice:"https://leetcode.com/problems/trapping-rain-water/", difficulty:"Hard" },{ title:"Largest Rectangle in Histogram", yt:"https://youtu.be/X0X7ne0gjOg", article:"https://takeuforward.org/data-structure/area-of-largest-rectangle-in-histogram/", practice:"https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty:"Hard" },{ title:"Sum of Subarray Minimums", yt:"https://youtu.be/pNSXMuffpmQ", article:"https://takeuforward.org/data-structure/sum-of-subarray-minimums/", practice:"https://leetcode.com/problems/sum-of-subarray-minimums/", difficulty:"Medium" },{ title:"Sum of Subarray Ranges", yt:"https://youtu.be/jC_cWLy7jSI", article:"https://takeuforward.org/data-structure/sum-of-subarray-ranges/", practice:"https://leetcode.com/problems/sum-of-subarray-ranges/", difficulty:"Medium" },{ title:"Asteroid Collision", yt:"https://youtu.be/LN7KjRszjk4", article:"https://takeuforward.org/data-structure/asteroid-collision/", practice:"https://leetcode.com/problems/asteroid-collision/", difficulty:"Medium" },{ title:"Remove K Digits", yt:"https://youtu.be/cFabMOnJaq0", article:"https://takeuforward.org/data-structure/remove-k-digits/", practice:"https://leetcode.com/problems/remove-k-digits/", difficulty:"Medium" },{ title:"Maximal Rectangle in Matrix", yt:"https://youtu.be/tOylVCugy9k", article:"https://takeuforward.org/data-structure/maximal-rectangle-area/", practice:"https://leetcode.com/problems/maximal-rectangle/", difficulty:"Hard" },{ title:"Sliding Window Maximum (Deque)", yt:"https://youtu.be/CZB6yhLoyQk", article:"https://takeuforward.org/data-structure/sliding-window-maximum/", practice:"https://leetcode.com/problems/sliding-window-maximum/", difficulty:"Hard" },{ title:"Daily Temperatures", practice:"https://leetcode.com/problems/daily-temperatures/", difficulty:"Medium" },{ title:"Online Stock Span", practice:"https://leetcode.com/problems/online-stock-span/", difficulty:"Medium" }
  ]}
]},{ step:10, title:"Sliding Window & Two Pointer Combined Problems", week:6, subtopics:[
  { name:"Medium Problems", problems:[
      { title:"Longest Subarray with Sum K (Positives)", yt:"https://youtu.be/SI_bV2t_0v4", article:"https://takeuforward.org/data-structure/longest-subarray-with-sum-k/", practice:"https://takeuforward.org/plus" },{ title:"Longest Subarray with K 1s", yt:"https://youtu.be/fFe1uJX1uQg", article:"https://takeuforward.org/data-structure/longest-subarray-with-sum-k-for-arrays-with-positives-and-zeroes/", practice:"https://leetcode.com/problems/max-consecutive-ones-iii/", difficulty:"Medium" },{ title:"Longest Substring with K Unique Characters", yt:"https://youtu.be/KiFLRc6l2gM", article:"https://takeuforward.org/data-structure/longest-substring-with-k-unique-characters/", practice:"https://takeuforward.org/plus" },{ title:"Longest Substring Without Repeating Characters", yt:"https://youtu.be/qtVh-XEpsJo", article:"https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/", practice:"https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty:"Medium" },{ title:"Fruits into Baskets", yt:"https://youtu.be/e3bs0uA1NhQ", article:"https://takeuforward.org/data-structure/fruit-into-baskets/", practice:"https://leetcode.com/problems/fruit-into-baskets/", difficulty:"Medium" },{ title:"Binary Subarrays with Sum", yt:"https://youtu.be/9LcMGLKo6V0", article:"https://takeuforward.org/data-structure/binary-subarrays-with-sum/", practice:"https://leetcode.com/problems/binary-subarrays-with-sum/", difficulty:"Medium" },{ title:"Count Nice Subarrays (Odd Numbers)", yt:"https://youtu.be/UqlI4CuTZ9g", article:"https://takeuforward.org/data-structure/count-number-of-nice-subarrays/", practice:"https://leetcode.com/problems/count-number-of-nice-subarrays/", difficulty:"Medium" },{ title:"Substrings with All Three Characters", yt:"https://youtu.be/-zSGNjkt8qI", article:"https://takeuforward.org/data-structure/number-of-substrings-containing-all-three-characters/", practice:"https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/", difficulty:"Medium" },{ title:"Maximum Points from Cards", yt:"https://youtu.be/A3UtekJgi5s", article:"https://takeuforward.org/data-structure/maximum-points-you-can-obtain-from-cards/", practice:"https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/", difficulty:"Medium" },{ title:"Reduce Array Size to The Half", practice:"https://leetcode.com/problems/reduce-array-size-to-the-half/", difficulty:"Medium" },{ title:"Car Pooling", practice:"https://leetcode.com/problems/car-pooling/", difficulty:"Medium" },{ title:"Minimum Cost to Hire K Workers", practice:"https://leetcode.com/problems/minimum-cost-to-hire-k-workers/", difficulty:"Hard" },{ title:"Seat Reservation Manager", practice:"https://leetcode.com/problems/seat-reservation-manager/", difficulty:"Medium" },{ title:"Process Tasks Using Servers", practice:"https://leetcode.com/problems/process-tasks-using-servers/", difficulty:"Medium" },{ title:"Path Sum II", practice:"https://leetcode.com/problems/path-sum-ii/", difficulty:"Medium" },{ title:"Path Sum III", practice:"https://leetcode.com/problems/path-sum-iii/", difficulty:"Medium" },{ title:"Spiral Matrix II", practice:"https://leetcode.com/problems/spiral-matrix-ii/", difficulty:"Medium" }
  ]},{ name:"Hard Problems", problems:[
      { title:"Minimum Size Subarray Sum", yt:"https://youtu.be/Xg8ykJFKPQE", article:"https://takeuforward.org/data-structure/minimum-size-subarray-sum/", practice:"https://leetcode.com/problems/minimum-size-subarray-sum/", difficulty:"Medium" },{ title:"Minimum Window Substring", yt:"https://youtu.be/WJaij9ffOIY", article:"https://takeuforward.org/data-structure/minimum-window-substring/", practice:"https://leetcode.com/problems/minimum-window-substring/", difficulty:"Hard" },{ title:"Permutation in String", yt:"https://youtu.be/UbyhOgBN834", article:"https://takeuforward.org/data-structure/permutation-in-string/", practice:"https://leetcode.com/problems/permutation-in-string/", difficulty:"Medium" },{ title:"Longest Repeating Character Replacement", yt:"https://youtu.be/_eNhaDkMXEA", article:"https://takeuforward.org/data-structure/longest-repeating-character-replacement/", practice:"https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty:"Medium" },{ title:"Number of Substrings with All 1s", yt:"https://youtu.be/1aFV0sUNHMc", article:"https://takeuforward.org/data-structure/count-substrings-with-all-1s/", practice:"https://leetcode.com/problems/count-substrings-with-only-one-distinct-letter/", difficulty:"Easy" },{ title:"IPO", practice:"https://leetcode.com/problems/ipo/", difficulty:"Hard" },{ title:"Maximum Performance of a Team", practice:"https://leetcode.com/problems/maximum-performance-of-a-team/", difficulty:"Hard" },{ title:"Binary Tree Cameras", practice:"https://leetcode.com/problems/binary-tree-cameras/", difficulty:"Hard" }
  ]}
]},{ step:11, title:"Heaps [Learning, Medium Problems, Hard Problems]", week:6, subtopics:[
  { name:"Learning", problems:[
      { title:"Introduction to Heap (Min/Max Heap)", yt:"https://youtu.be/HqPJF2L5h9U", article:"https://takeuforward.org/heap/introduction-to-heap/", practice:"https://takeuforward.org/plus" },{ title:"Check if Binary Tree is a Heap", yt:"https://youtu.be/i41AqPYdFBU", article:"https://takeuforward.org/heap/check-if-bt-is-heap/", practice:"https://takeuforward.org/plus" },
  ]},{ name:"Medium Problems", problems:[
      { title:"Kth Largest Element in Array", yt:"https://youtu.be/ywWBy6J5gz8", article:"https://takeuforward.org/data-structure/kth-largest-element-in-an-array/", practice:"https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty:"Medium" },{ title:"Kth Smallest Element in Array", yt:"https://youtu.be/9XALmcSKDrc", article:"https://takeuforward.org/data-structure/kth-smallest-element-in-an-array/", practice:"https://takeuforward.org/plus" },{ title:"Sort a K-Sorted Array", yt:"https://youtu.be/lZB5AySnVxk", article:"https://takeuforward.org/heap/sort-k-sorted-array/", practice:"https://takeuforward.org/plus" },{ title:"Top K Frequent Elements", yt:"https://youtu.be/vgrQPMCGSOg", article:"https://takeuforward.org/data-structure/top-k-frequent-elements/", practice:"https://leetcode.com/problems/top-k-frequent-elements/", difficulty:"Medium" },{ title:"Task Scheduler", yt:"https://youtu.be/ySTQCRya6B0", article:"https://takeuforward.org/data-structure/task-scheduler/", practice:"https://leetcode.com/problems/task-scheduler/", difficulty:"Medium" },{ title:"Hands of Straights", yt:"https://youtu.be/amnrMX4NyiE", article:"https://takeuforward.org/greedy/hand-of-straights/", practice:"https://leetcode.com/problems/hand-of-straights/", difficulty:"Medium" },{ title:"K Most Frequent Words", yt:"https://youtu.be/WwfnCDtRRjk", article:"https://takeuforward.org/heap/k-most-frequent-words/", practice:"https://leetcode.com/problems/top-k-frequent-words/", difficulty:"Medium" },
  ]},{ name:"Hard Problems", problems:[
      { title:"Replace Elements by Rank", yt:"https://youtu.be/Xd_5FiQQGiI", article:"https://takeuforward.org/heap/replace-elements-by-rank/", practice:"https://takeuforward.org/plus" },{ title:"Find Median from Data Stream", yt:"https://youtu.be/itmhHWaHupI", article:"https://takeuforward.org/data-structure/find-median-from-data-stream/", practice:"https://leetcode.com/problems/find-median-from-data-stream/", difficulty:"Hard" },{ title:"K Closest Points to Origin", yt:"https://youtu.be/rI2EBUEMfTk", article:"https://takeuforward.org/heap/k-closest-points-to-origin/", practice:"https://leetcode.com/problems/k-closest-points-to-origin/", difficulty:"Medium" },{ title:"Maximum Sum Combination", yt:"https://youtu.be/gCJovpFpEgg", article:"https://takeuforward.org/heap/maximum-sum-combinations/", practice:"https://www.interviewbit.com/problems/maximum-sum-combinations/" },
  ]}
]},{ step:12, title:"Greedy Algorithms [Easy, Medium/Hard]", week:7, subtopics:[
  { name:"Easy Problems", problems:[
      { title:"Assign Cookies", yt:"https://youtu.be/DIX2p7vb9co", article:"https://takeuforward.org/greedy/assign-cookies/", practice:"https://leetcode.com/problems/assign-cookies/", difficulty:"Easy" },{ title:"Fractional Knapsack", yt:"https://youtu.be/F_DDzYnxO14", article:"https://takeuforward.org/data-structure/fractional-knapsack-problem-greedy-approach/", practice:"https://takeuforward.org/plus" },{ title:"Greedy Job Sequencing", yt:"https://youtu.be/LjPx4wQaRIs", article:"https://takeuforward.org/data-structure/job-sequencing-problem/", practice:"https://takeuforward.org/plus" },{ title:"N Meetings in One Room", yt:"https://youtu.be/mKfhTotEguk", article:"https://takeuforward.org/data-structure/n-meetings-in-one-room/", practice:"https://takeuforward.org/plus" },{ title:"Minimum Platforms Required for Railway", yt:"https://youtu.be/AsGzwR_FWok", article:"https://takeuforward.org/data-structure/minimum-number-of-platforms-required-for-a-railway/", practice:"https://takeuforward.org/plus" },{ title:"Minimum Coins", yt:"https://youtu.be/mVg9CfJvayM", article:"https://takeuforward.org/data-structure/find-minimum-number-of-coins/", practice:"https://leetcode.com/problems/coin-change/", difficulty:"Medium" },{ title:"Lemonade Change", practice:"https://leetcode.com/problems/lemonade-change/", difficulty:"Easy" },{ title:"Minimum Absolute Difference", practice:"https://leetcode.com/problems/minimum-absolute-difference/", difficulty:"Easy" },{ title:"Is Subsequence", practice:"https://leetcode.com/problems/is-subsequence/", difficulty:"Easy" },{ title:"Monotone Increasing Digits", practice:"https://leetcode.com/problems/monotone-increasing-digits/", difficulty:"Medium" }
  ]},{ name:"Medium / Hard Problems", problems:[
      { title:"Jump Game I", yt:"https://youtu.be/tZAa_jJ3SwQ", article:"https://takeuforward.org/data-structure/jump-game-greedy-approach/", practice:"https://leetcode.com/problems/jump-game/", difficulty:"Medium" },{ title:"Jump Game II", yt:"https://youtu.be/7SedJZqajCU", article:"https://takeuforward.org/data-structure/jump-game-2-greedy-approach/", practice:"https://leetcode.com/problems/jump-game-ii/", difficulty:"Medium" },{ title:"Candy Distribution", yt:"https://youtu.be/IIqVFvKE6RY", article:"https://takeuforward.org/data-structure/candy-leetcode-greedy-approach/", practice:"https://leetcode.com/problems/candy/", difficulty:"Hard" },{ title:"Insert Intervals", yt:"https://youtu.be/xxRE-46OCC8", article:"https://takeuforward.org/data-structure/insert-interval/", practice:"https://leetcode.com/problems/insert-interval/", difficulty:"Medium" },{ title:"Non-overlapping Intervals", yt:"https://youtu.be/nONCGxWoUfM", article:"https://takeuforward.org/data-structure/non-overlapping-intervals/", practice:"https://leetcode.com/problems/non-overlapping-intervals/", difficulty:"Medium" },{ title:"Valid Parenthesis String", yt:"https://youtu.be/cHT6sG_hUZI", article:"https://takeuforward.org/data-structure/valid-parenthesis-string/", practice:"https://leetcode.com/problems/valid-parenthesis-string/", difficulty:"Medium" },{ title:"Shortest Job First (SJF) Scheduling", yt:"https://youtu.be/VyWp3BIHKY8", article:"https://takeuforward.org/operating-systems/shortest-job-first/", practice:"https://takeuforward.org/plus" },{ title:"Gas Station", yt:"https://youtu.be/nTKdYm_5-ZY", article:"https://takeuforward.org/greedy/gas-station/", practice:"https://leetcode.com/problems/gas-station/", difficulty:"Medium" },{ title:"Largest Number", yt:"https://youtu.be/ffBCBqBRgj0", article:"https://takeuforward.org/greedy/largest-number/", practice:"https://leetcode.com/problems/largest-number/", difficulty:"Medium" },{ title:"Partition Labels", practice:"https://leetcode.com/problems/partition-labels/", difficulty:"Medium" },{ title:"Queue Reconstruction by Height", practice:"https://leetcode.com/problems/queue-reconstruction-by-height/", difficulty:"Medium" },{ title:"Minimum Number of Arrows to Burst Balloons", practice:"https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", difficulty:"Medium" },{ title:"Remove Covered Intervals", practice:"https://leetcode.com/problems/remove-covered-intervals/", difficulty:"Medium" },{ title:"Reorganize String", practice:"https://leetcode.com/problems/reorganize-string/", difficulty:"Medium" },{ title:"Wiggle Sort II", practice:"https://leetcode.com/problems/wiggle-sort-ii/", difficulty:"Medium" }
  ]}
]},{ step:13, title:"Binary Trees [Traversals, Medium, Hard Problems]", week:7, subtopics:[
  { name:"Traversals", problems:[
      { title:"Introduction to Binary Trees", yt:"https://youtu.be/hyynSAFRFaI", article:"https://takeuforward.org/data-structure/introduction-to-binary-trees/", practice:"https://takeuforward.org/plus" },{ title:"Preorder, Inorder, Postorder (Recursive)", yt:"https://youtu.be/RlUu72JrOUM", article:"https://takeuforward.org/data-structure/preorder-inorder-postorder-traversals-in-one-traversal/", practice:"https://leetcode.com/problems/binary-tree-inorder-traversal/", difficulty:"Easy" },{ title:"Iterative Preorder Traversal", yt:"https://youtu.be/80Zug6D1_r4", article:"https://takeuforward.org/data-structure/preorder-traversal-of-binary-tree-using-iterative-approach/", practice:"https://leetcode.com/problems/binary-tree-preorder-traversal/", difficulty:"Easy" },{ title:"Iterative Postorder (2 Stacks)", yt:"https://youtu.be/fCmKqRfuMb8", article:"https://takeuforward.org/data-structure/post-order-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-postorder-traversal/", difficulty:"Easy" },{ title:"Level Order Traversal (BFS)", yt:"https://youtu.be/EoAsWbO7sqg", article:"https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty:"Medium" },{ title:"Average of Levels in Binary Tree", practice:"https://leetcode.com/problems/average-of-levels-in-binary-tree/", difficulty:"Easy" },{ title:"Find Largest Value in Each Tree Row", practice:"https://leetcode.com/problems/find-largest-value-in-each-tree-row/", difficulty:"Medium" },{ title:"N-ary Tree Preorder Traversal", practice:"https://leetcode.com/problems/n-ary-tree-preorder-traversal/", difficulty:"Easy" },{ title:"N-ary Tree Level Order Traversal", practice:"https://leetcode.com/problems/n-ary-tree-level-order-traversal/", difficulty:"Medium" }
  ]},{ name:"Medium Problems", problems:[
      { title:"Height of Binary Tree", yt:"https://youtu.be/eD95WRfh81c", article:"https://takeuforward.org/data-structure/find-the-height-depth-of-a-binary-tree/", practice:"https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty:"Easy" },{ title:"Check Balanced Binary Tree", yt:"https://youtu.be/Yt50Jfbd8Po", article:"https://takeuforward.org/data-structure/check-whether-the-binary-tree-is-balanced-or-not/", practice:"https://leetcode.com/problems/balanced-binary-tree/", difficulty:"Easy" },{ title:"Diameter of Binary Tree", yt:"https://youtu.be/Rezetez59Nk", article:"https://takeuforward.org/data-structure/calculate-the-diameter-of-a-binary-tree/", practice:"https://leetcode.com/problems/diameter-of-binary-tree/", difficulty:"Easy" },{ title:"Maximum Path Sum in BT", yt:"https://youtu.be/WszrfSwMz58", article:"https://takeuforward.org/data-structure/maximum-sum-path-in-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty:"Hard" },{ title:"Same Tree / Identical Trees", yt:"https://youtu.be/BhuvF_-PWS0", article:"https://takeuforward.org/data-structure/check-if-two-trees-are-identical-or-not/", practice:"https://leetcode.com/problems/same-tree/", difficulty:"Easy" },{ title:"Zigzag Level Order Traversal", yt:"https://youtu.be/_AwsRyg3a5M", article:"https://takeuforward.org/data-structure/zigzag-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", difficulty:"Medium" },{ title:"Boundary Traversal", yt:"https://youtu.be/0ca1nvR0be4", article:"https://takeuforward.org/data-structure/boundary-traversal-of-binary-tree/", practice:"https://takeuforward.org/plus" },{ title:"Vertical Order Traversal", yt:"https://youtu.be/q_a6lpbKJdw", article:"https://takeuforward.org/data-structure/vertical-order-traversal-of-binary-tree/", practice:"https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/", difficulty:"Hard" },{ title:"Top View of Binary Tree", yt:"https://youtu.be/Et9OCDNvJ78", article:"https://takeuforward.org/data-structure/top-view-of-a-binary-tree/", practice:"https://takeuforward.org/plus" },{ title:"Bottom View of Binary Tree", yt:"https://youtu.be/0FtVY6I4pB8", article:"https://takeuforward.org/data-structure/bottom-view-of-a-binary-tree/", practice:"https://takeuforward.org/plus" },{ title:"Right View / Left View", yt:"https://youtu.be/KV4mRzTjlAk", article:"https://takeuforward.org/data-structure/right-left-view-of-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-right-side-view/", difficulty:"Medium" },{ title:"Symmetric Binary Tree", yt:"https://youtu.be/nKggNAiEpBE", article:"https://takeuforward.org/data-structure/check-for-symmetrical-binary-tree/", practice:"https://leetcode.com/problems/symmetric-tree/", difficulty:"Easy" },{ title:"Root to Node Path", yt:"https://youtu.be/fmflMqVOC7k", article:"https://takeuforward.org/data-structure/print-root-to-node-path-in-a-binary-tree/", practice:"https://leetcode.com/problems/binary-tree-paths/", difficulty:"Easy" },{ title:"LCA of Binary Tree", yt:"https://youtu.be/0r3cEKZiLmg", article:"https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/", practice:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", difficulty:"Medium" },
  ]},{ name:"Hard Problems", problems:[
      { title:"Maximum Width of Binary Tree", yt:"https://youtu.be/ZbybYvcVLks", article:"https://takeuforward.org/data-structure/maximum-width-of-binary-tree/", practice:"https://leetcode.com/problems/maximum-width-of-binary-tree/", difficulty:"Medium" },{ title:"Children Sum Property", yt:"https://youtu.be/fnmisPM6cVo", article:"https://takeuforward.org/data-structure/check-for-children-sum-property-in-a-binary-tree/", practice:"https://takeuforward.org/plus" },{ title:"Minimum Time to Burn Binary Tree", yt:"https://youtu.be/2r5wLmQfD6g", article:"https://takeuforward.org/data-structure/minimum-time-taken-to-burn-the-binary-tree-from-a-node/", practice:"https://takeuforward.org/plus" },{ title:"Count Nodes in Complete Binary Tree", yt:"https://youtu.be/u-yWemKGWO0", article:"https://takeuforward.org/data-structure/count-nodes-in-a-complete-binary-tree/", practice:"https://leetcode.com/problems/count-complete-tree-nodes/", difficulty:"Easy" },{ title:"Requirements to Construct Unique BT", yt:"https://youtu.be/5s0ojfWCm_E", article:"https://takeuforward.org/data-structure/requirement-for-unique-binary-tree/", practice:"https://takeuforward.org/plus" },{ title:"Construct BT from Preorder & Inorder", yt:"https://youtu.be/aZNaLrVebKQ", article:"https://takeuforward.org/data-structure/construct-a-binary-tree-from-inorder-and-preorder-traversal/", practice:"https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", difficulty:"Medium" },{ title:"Construct BT from Postorder & Inorder", yt:"https://youtu.be/LgLRTaEMRVc", article:"https://takeuforward.org/data-structure/construct-a-binary-tree-from-inorder-and-postorder-traversal/", practice:"https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/", difficulty:"Medium" },{ title:"Flatten Binary Tree to Linked List", yt:"https://youtu.be/sWf7k1x9XR4", article:"https://takeuforward.org/data-structure/flatten-binary-tree-to-linked-list/", practice:"https://leetcode.com/problems/flatten-binary-tree-to-linked-list/", difficulty:"Medium" },{ title:"Serialize and Deserialize Binary Tree", yt:"https://youtu.be/-YbXySKJsX8", article:"https://takeuforward.org/data-structure/serialize-and-deserialize-binary-tree/", practice:"https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty:"Hard" },
  ]}
]},{ step:14, title:"Binary Search Trees [Concept & Problems]", week:7, subtopics:[
  { name:"Concepts", problems:[
      { title:"Introduction to BST", yt:"https://youtu.be/p7-9UvDQZ3w", article:"https://takeuforward.org/data-structure/introduction-to-binary-search-tree/", practice:"https://leetcode.com/problems/search-in-a-binary-search-tree/", difficulty:"Easy" },{ title:"Floor in BST", yt:"https://youtu.be/xm_W1ub-K-w", article:"https://takeuforward.org/data-structure/floor-in-a-binary-search-tree/", practice:"https://takeuforward.org/plus" },{ title:"Ceil in BST", yt:"https://youtu.be/xm_W1ub-K-w", article:"https://takeuforward.org/data-structure/ceil-in-a-binary-search-tree/", practice:"https://takeuforward.org/plus" },{ title:"Insert a Node in BST", yt:"https://youtu.be/FiFiNvM29ps", article:"https://takeuforward.org/data-structure/insert-a-node-in-binary-search-tree/", practice:"https://leetcode.com/problems/insert-into-a-binary-search-tree/", difficulty:"Medium" },{ title:"Delete a Node in BST", yt:"https://youtu.be/kouxiP_H5WE", article:"https://takeuforward.org/data-structure/delete-a-node-in-binary-search-tree/", practice:"https://leetcode.com/problems/delete-node-in-a-bst/", difficulty:"Medium" },{ title:"Range Sum of BST", practice:"https://leetcode.com/problems/range-sum-of-bst/", difficulty:"Easy" },{ title:"Trim a Binary Search Tree", practice:"https://leetcode.com/problems/trim-a-binary-search-tree/", difficulty:"Medium" },{ title:"Balance a Binary Search Tree", practice:"https://leetcode.com/problems/balance-a-binary-search-tree/", difficulty:"Medium" },{ title:"Increasing Order Search Tree", practice:"https://leetcode.com/problems/increasing-order-search-tree/", difficulty:"Easy" }
  ]},{ name:"Problems on BST", problems:[
      { title:"Kth Smallest / Largest Element in BST", yt:"https://youtu.be/9TJYWh0adfk", article:"https://takeuforward.org/data-structure/kth-largest-smallest-element-in-binary-search-tree/", practice:"https://leetcode.com/problems/kth-smallest-element-in-a-bst/", difficulty:"Medium" },{ title:"LCA of Binary Search Tree", yt:"https://youtu.be/cX_kFSSIYf8", article:"https://takeuforward.org/data-structure/lowest-common-ancestor-in-a-binary-search-tree/", practice:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty:"Medium" },{ title:"Construct BST from Preorder Traversal", yt:"https://youtu.be/UmJT3j26t1I", article:"https://takeuforward.org/data-structure/construct-a-bst-from-a-preorder-traversal/", practice:"https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/", difficulty:"Medium" },{ title:"Inorder Successor / Predecessor in BST", yt:"https://youtu.be/SXKAD2svfmI", article:"https://takeuforward.org/data-structure/find-inorder-successor-predecessor-of-a-node-in-bst/", practice:"https://leetcode.com/problems/inorder-successor-in-bst/", difficulty:"Medium" },{ title:"BST Iterator", yt:"https://youtu.be/D2jMcmxU4bs", article:"https://takeuforward.org/data-structure/binary-search-tree-iterator/", practice:"https://leetcode.com/problems/binary-search-tree-iterator/", difficulty:"Medium" },{ title:"Two Sum in BST", yt:"https://youtu.be/ssL3sHwPeb4", article:"https://takeuforward.org/data-structure/two-sum-in-bst/", practice:"https://leetcode.com/problems/two-sum-iv-input-is-a-bst/", difficulty:"Easy" },{ title:"Recover BST (Fix Two Swapped Nodes)", yt:"https://youtu.be/ZWGW7FminDM", article:"https://takeuforward.org/data-structure/recover-bst-correct-bst-with-two-nodes-swapped/", practice:"https://leetcode.com/problems/recover-binary-search-tree/", difficulty:"Medium" },{ title:"Largest BST in a Binary Tree", yt:"https://youtu.be/X0oXMdtUDwo", article:"https://takeuforward.org/data-structure/largest-bst-in-binary-tree/", practice:"https://takeuforward.org/plus" },{ title:"Validate Binary Search Tree", yt:"https://youtu.be/f-sj7I5oXEI", article:"https://takeuforward.org/data-structure/validate-binary-search-tree/", practice:"https://leetcode.com/problems/validate-binary-search-tree/", difficulty:"Medium" },{ title:"Convert Sorted Array to Binary Search Tree", practice:"https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/", difficulty:"Easy" },{ title:"Find Mode in Binary Search Tree", practice:"https://leetcode.com/problems/find-mode-in-binary-search-tree/", difficulty:"Easy" },{ title:"Minimum Distance Between BST Nodes", practice:"https://leetcode.com/problems/minimum-distance-between-bst-nodes/", difficulty:"Easy" }
  ]}
]},{ step:15, title:"Graphs [BFS, DFS, Topo, Shortest Path, MST, DSU]", week:8, subtopics:[
  { name:"Learning – BFS/DFS", problems:[
      { title:"Graph Representation (Adjacency Matrix/List)", yt:"https://youtu.be/M3_pLsDdeuU", article:"https://takeuforward.org/graph/introduction-to-graph/", practice:"https://takeuforward.org/plus" },{ title:"BFS Traversal", yt:"https://youtu.be/iu1umy77DvI", article:"https://takeuforward.org/graph/breadth-first-search-bfs-level-order-traversal/", practice:"https://leetcode.com/problems/number-of-islands/", difficulty:"Medium" },{ title:"Number of Provinces", yt:"https://youtu.be/ACzkVtewUYA", article:"https://takeuforward.org/graph/number-of-provinces/", practice:"https://leetcode.com/problems/number-of-provinces/", difficulty:"Medium" },{ title:"Flood Fill", yt:"https://youtu.be/C-2_uSRli8o", article:"https://takeuforward.org/graph/flood-fill-algorithm/", practice:"https://leetcode.com/problems/flood-fill/", difficulty:"Easy" },{ title:"Rotten Oranges", yt:"https://youtu.be/yf3oUhkvqA0", article:"https://takeuforward.org/graph/rotten-oranges/", practice:"https://leetcode.com/problems/rotting-oranges/", difficulty:"Medium" },{ title:"Cycle Detection in Undirected Graph (BFS)", yt:"https://youtu.be/BPlrALf1LDU", article:"https://takeuforward.org/graph/detect-cycle-in-an-undirected-graph-using-bfs/", practice:"https://takeuforward.org/plus" },{ title:"Cycle Detection in Undirected Graph (DFS)", yt:"https://youtu.be/zQ3zgFypzX4", article:"https://takeuforward.org/graph/detect-cycle-in-an-undirected-graph-using-dfs/", practice:"https://takeuforward.org/plus" },{ title:"0/1 Matrix (Multi-source BFS)", yt:"https://youtu.be/edXdVwkYHF8", article:"https://takeuforward.org/graph/01-matrix/", practice:"https://leetcode.com/problems/01-matrix/", difficulty:"Medium" },{ title:"Surrounded Regions", yt:"https://youtu.be/BtdgAys4yMk", article:"https://takeuforward.org/graph/surrounded-regions/", practice:"https://leetcode.com/problems/surrounded-regions/", difficulty:"Medium" },{ title:"Find the Town Judge", practice:"https://leetcode.com/problems/find-the-town-judge/", difficulty:"Easy" },{ title:"Find Center of Star Graph", practice:"https://leetcode.com/problems/find-center-of-star-graph/", difficulty:"Easy" },{ title:"All Paths From Source to Target", practice:"https://leetcode.com/problems/all-paths-from-source-to-target/", difficulty:"Medium" },{ title:"Keys and Rooms", practice:"https://leetcode.com/problems/keys-and-rooms/", difficulty:"Medium" },{ title:"Max Area of Island", practice:"https://leetcode.com/problems/max-area-of-island/", difficulty:"Medium" },{ title:"Clone Graph", practice:"https://leetcode.com/problems/clone-graph/", difficulty:"Medium" }
  ]},{ name:"Topo Sort & Directed Graph", problems:[
      { title:"Bipartite Graph (BFS)", yt:"https://youtu.be/nbgaEu-pvkU", article:"https://takeuforward.org/graph/bipartite-graph/", practice:"https://leetcode.com/problems/is-graph-bipartite/", difficulty:"Medium" },{ title:"Topological Sort (DFS)", yt:"https://youtu.be/5lJ8-TlG7YE", article:"https://takeuforward.org/graph/topological-sort-algorithm-dfs/", practice:"https://takeuforward.org/plus" },{ title:"Topological Sort – Kahn's Algorithm (BFS)", yt:"https://youtu.be/73sneFXuTEg", article:"https://takeuforward.org/graph/kahns-algorithm-topological-sort/", practice:"https://takeuforward.org/plus" },{ title:"Cycle Detection in Directed Graph (DFS)", yt:"https://youtu.be/9twcmtQj4DU", article:"https://takeuforward.org/graph/detect-cycle-in-directed-graph-using-dfs-based-approach/", practice:"https://takeuforward.org/plus" },{ title:"Cycle Detection Directed (Kahn's)", yt:"https://youtu.be/iTBaI90lpDQ", article:"https://takeuforward.org/graph/detect-cycle-directed-graph-kahn/", practice:"https://takeuforward.org/plus" },{ title:"Course Schedule I & II", yt:"https://youtu.be/WAOfKpxYHR8", article:"https://takeuforward.org/data-structure/course-schedule-ii/", practice:"https://leetcode.com/problems/course-schedule/", difficulty:"Medium" },{ title:"Find Eventual Safe States", yt:"https://youtu.be/uRbJ1OF9aYM", article:"https://takeuforward.org/graph/eventual-safe-states/", practice:"https://leetcode.com/problems/find-eventual-safe-states/", difficulty:"Medium" },{ title:"Alien Dictionary", yt:"https://youtu.be/U3N_je7tWAs", article:"https://takeuforward.org/data-structure/alien-dictionary-topological-sort/", practice:"https://leetcode.com/problems/alien-dictionary/", difficulty:"Hard" },{ title:"Accounts Merge (DSU)", yt:"https://youtu.be/FMwpt_aQOGo", article:"https://takeuforward.org/data-structure/accounts-merge/", practice:"https://leetcode.com/problems/accounts-merge/", difficulty:"Medium" },{ title:"Parallel Courses", practice:"https://leetcode.com/problems/parallel-courses/", difficulty:"Medium" },{ title:"Minimum Height Trees", practice:"https://leetcode.com/problems/minimum-height-trees/", difficulty:"Medium" },{ title:"Longest Path With Different Adjacent Characters", practice:"https://leetcode.com/problems/longest-path-with-different-adjacent-characters/", difficulty:"Hard" }
  ]},{ name:"Shortest Path Algorithms", problems:[
      { title:"Shortest Path in DAG (Topo Sort)", yt:"https://youtu.be/ZUFQfFaU-8U", article:"https://takeuforward.org/graph/shortest-path-for-directed-acyclic-graphs/", practice:"https://takeuforward.org/plus" },{ title:"Shortest Path in Undirected Graph (BFS)", yt:"https://youtu.be/C4gxoTaI71U", article:"https://takeuforward.org/graph/shortest-path-in-undirected-graph/", practice:"https://takeuforward.org/plus" },{ title:"Dijkstra's Algorithm", yt:"https://youtu.be/V6H1qAeB-l4", article:"https://takeuforward.org/graph/dijkstras-algorithm/", practice:"https://leetcode.com/problems/network-delay-time/", difficulty:"Medium" },{ title:"Bellman Ford Algorithm", yt:"https://youtu.be/75yC1vbS8S8", article:"https://takeuforward.org/data-structure/bellman-ford-algorithm-g-41/", practice:"https://takeuforward.org/plus" },{ title:"Floyd Warshall Algorithm", yt:"https://youtu.be/YbY8cVwWAvw", article:"https://takeuforward.org/graph/floyd-warshall-algorithm/", practice:"https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/", difficulty:"Medium" },{ title:"Word Ladder I", yt:"https://youtu.be/tRPda0rcf8E", article:"https://takeuforward.org/graph/word-ladder-i/", practice:"https://leetcode.com/problems/word-ladder/", difficulty:"Hard" },{ title:"Word Ladder II", yt:"https://youtu.be/DREutrv2XD0", article:"https://takeuforward.org/graph/word-ladder-ii/", practice:"https://leetcode.com/problems/word-ladder-ii/", difficulty:"Hard" },{ title:"Shortest Path in Binary Matrix", practice:"https://leetcode.com/problems/shortest-path-in-binary-matrix/", difficulty:"Medium" },{ title:"Cheapest Flights Within K Stops", practice:"https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty:"Medium" },{ title:"Path with Maximum Probability", practice:"https://leetcode.com/problems/path-with-maximum-probability/", difficulty:"Medium" }
  ]},{ name:"MST / DSU / Advanced", problems:[
      { title:"Prim's Algorithm – Minimum Spanning Tree", yt:"https://youtu.be/mJcZjjKzeqk", article:"https://takeuforward.org/graph/prims-algorithm-minimum-spanning-tree/", practice:"https://leetcode.com/problems/min-cost-to-connect-all-points/", difficulty:"Medium" },{ title:"Strongly Connected Components (Kosaraju)", yt:"https://youtu.be/R6uoSjZ2imo", article:"https://takeuforward.org/graph/strongly-connected-components-kosarajus-algorithm/", practice:"https://takeuforward.org/plus" },{ title:"Articulation Points in Graph", yt:"https://youtu.be/j1QX9hxM3S0", article:"https://takeuforward.org/graph/articulation-point-in-graph/", practice:"https://leetcode.com/problems/critical-connections-in-a-network/", difficulty:"Hard" },{ title:"Number of Ways to Reach Destination (DP+Graph)", yt:"https://youtu.be/PATgNiyd2n0", article:"https://takeuforward.org/graph/number-of-ways-in-maze/", practice:"https://leetcode.com/problems/number-of-paths-in-directed-graph/" },{ title:"Redundant Connection", practice:"https://leetcode.com/problems/redundant-connection/", difficulty:"Medium" },{ title:"Swim in Rising Water", practice:"https://leetcode.com/problems/swim-in-rising-water/", difficulty:"Hard" }
  ]}
]},{ step:16, title:"Dynamic Programming [Patterns & Problems]", week:8, subtopics:[
  { name:"Introduction to DP", problems:[
      { title:"Introduction to DP (Memoization & Tabulation)", yt:"https://youtu.be/tyB0ztf0DNY", article:"https://takeuforward.org/data-structure/dynamic-programming-introduction/", practice:"https://leetcode.com/problems/climbing-stairs/", difficulty:"Easy" },{ title:"Frog Jump (1D DP)", yt:"https://youtu.be/EgG3jsGoPvg", article:"https://takeuforward.org/data-structure/frog-jump-dp-3/", practice:"https://takeuforward.org/plus" },{ title:"Frog Jump with K Distances", yt:"https://youtu.be/Kmh3rhyEtB8", article:"https://takeuforward.org/data-structure/frog-jump-with-k-distances-dp-4/", practice:"https://takeuforward.org/plus" },{ title:"Maximum Sum of Non-Adjacent Elements", yt:"https://youtu.be/GrMBfJNk_NY", article:"https://takeuforward.org/data-structure/maximum-sum-of-non-adjacent-elements/", practice:"https://leetcode.com/problems/house-robber/", difficulty:"Medium" },{ title:"House Robber II", yt:"https://youtu.be/3WaqgiPTagY", article:"https://takeuforward.org/data-structure/house-robber-2/", practice:"https://leetcode.com/problems/house-robber-ii/", difficulty:"Medium" },{ title:"Min Cost Climbing Stairs", practice:"https://leetcode.com/problems/min-cost-climbing-stairs/", difficulty:"Easy" },{ title:"Tribonacci Number", practice:"https://leetcode.com/problems/n-th-tribonacci-number/", difficulty:"Easy" },{ title:"Delete and Earn", practice:"https://leetcode.com/problems/delete-and-earn/", difficulty:"Medium" }
  ]},{ name:"2D / Grid DP", problems:[
      { title:"Ninja's Training (2D DP)", yt:"https://youtu.be/AE39gJYuRog", article:"https://takeuforward.org/data-structure/ninja-s-training-dp-7/", practice:"https://takeuforward.org/plus" },{ title:"Unique Paths in Grid", yt:"https://youtu.be/t_f0nwwdg5o", article:"https://takeuforward.org/data-structure/grid-unique-paths-count-paths-from-left-top-to-the-right-bottom-of-a-matrix/", practice:"https://leetcode.com/problems/unique-paths/", difficulty:"Medium" },{ title:"Unique Paths II (Obstacles)", yt:"https://youtu.be/TmhpgXScLyY", article:"https://takeuforward.org/data-structure/unique-paths-ii-dp-9/", practice:"https://leetcode.com/problems/unique-paths-ii/", difficulty:"Medium" },{ title:"Minimum Path Sum in Grid", yt:"https://youtu.be/_rgTlyky1uQ", article:"https://takeuforward.org/data-structure/minimum-path-sum-in-grid/", practice:"https://leetcode.com/problems/minimum-path-sum/", difficulty:"Medium" },{ title:"Triangle – Minimum Path Sum", yt:"https://youtu.be/SrP-PiLSYC0", article:"https://takeuforward.org/data-structure/minimum-path-sum-in-triangular-grid/", practice:"https://leetcode.com/problems/triangle/", difficulty:"Medium" },{ title:"Minimum / Maximum Falling Path Sum", yt:"https://youtu.be/N_aJ5pRuxuo", article:"https://takeuforward.org/data-structure/minimum-maximum-falling-path-sum/", practice:"https://leetcode.com/problems/minimum-falling-path-sum/", difficulty:"Medium" },{ title:"Cherry Pickup II (3D DP)", yt:"https://youtu.be/QGfn7JeXK54", article:"https://takeuforward.org/data-structure/3-d-dp-ninja-and-his-friends-dp-13/", practice:"https://leetcode.com/problems/cherry-pickup-ii/", difficulty:"Hard" },{ title:"Dungeon Game", practice:"https://leetcode.com/problems/dungeon-game/", difficulty:"Hard" },{ title:"Cherry Pickup", practice:"https://leetcode.com/problems/cherry-pickup/", difficulty:"Hard" },{ title:"Count Square Submatrices with All Ones", practice:"https://leetcode.com/problems/count-square-submatrices-with-all-ones/", difficulty:"Medium" },{ title:"Maximal Square", practice:"https://leetcode.com/problems/maximal-square/", difficulty:"Medium" }
  ]},{ name:"DP on Subsequences", problems:[
      { title:"Subset Sum Equals Target", yt:"https://youtu.be/F7wqWbqYn9g", article:"https://takeuforward.org/data-structure/subset-sum-equal-to-target-dp-14/", practice:"https://takeuforward.org/plus" },{ title:"Partition Equal Subset Sum", yt:"https://youtu.be/7win3dcgo3k", article:"https://takeuforward.org/data-structure/partition-equal-subset-sum-dp-15/", practice:"https://leetcode.com/problems/partition-equal-subset-sum/", difficulty:"Medium" },{ title:"Partition Two Subsets with Min Difference", yt:"https://youtu.be/GS_OqZb2CWc", article:"https://takeuforward.org/data-structure/minimum-absolute-difference-in-partition/", practice:"https://leetcode.com/problems/last-stone-weight-ii/", difficulty:"Medium" },{ title:"0/1 Knapsack", yt:"https://youtu.be/GqOTyWuiBOQ", article:"https://takeuforward.org/data-structure/0-1-knapsack-dp-19/", practice:"https://takeuforward.org/plus" },{ title:"Coin Change II – Number of Ways", yt:"https://youtu.be/HgyouUi11zk", article:"https://takeuforward.org/data-structure/count-partitions-with-given-difference-dp-18/", practice:"https://leetcode.com/problems/coin-change-ii/", difficulty:"Medium" },{ title:"Target Sum (Assign +/- to Nums)", yt:"https://youtu.be/b3GmCYQfIvY", article:"https://takeuforward.org/data-structure/target-sum-dp-21/", practice:"https://leetcode.com/problems/target-sum/", difficulty:"Medium" },{ title:"Rod Cutting", yt:"https://youtu.be/mO8XpGoJwuo", article:"https://takeuforward.org/data-structure/rod-cutting-problem-dp-24/", practice:"https://takeuforward.org/plus" },{ title:"Minimum ASCII Delete Sum for Two Strings", practice:"https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/", difficulty:"Medium" },{ title:"Uncrossed Lines", practice:"https://leetcode.com/problems/uncrossed-lines/", difficulty:"Medium" },{ title:"Maximum Length of Repeated Subarray", practice:"https://leetcode.com/problems/maximum-length-of-repeated-subarray/", difficulty:"Medium" }
  ]},{ name:"DP on Strings", problems:[
      { title:"Longest Common Subsequence", yt:"https://youtu.be/-Le6aYQnxqg", article:"https://takeuforward.org/data-structure/longest-common-subsequence-dp-25/", practice:"https://leetcode.com/problems/longest-common-subsequence/", difficulty:"Medium" },{ title:"Longest Common Substring", yt:"https://youtu.be/BBgesL03LF0", article:"https://takeuforward.org/data-structure/longest-common-substring/", practice:"https://takeuforward.org/plus" },{ title:"Longest Palindromic Subsequence", yt:"https://youtu.be/6i_T5kkfv4A", article:"https://takeuforward.org/data-structure/longest-palindromic-subsequence-dp-28/", practice:"https://leetcode.com/problems/longest-palindromic-subsequence/", difficulty:"Medium" },{ title:"Minimum Insertions to Make Palindrome", yt:"https://youtu.be/xPBLEj41rFU", article:"https://takeuforward.org/data-structure/minimum-insertions-to-make-string-palindrome/", practice:"https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/", difficulty:"Hard" },{ title:"Minimum Insertions/Deletions to Convert", yt:"https://youtu.be/yMnH0jrir0Q", article:"https://takeuforward.org/data-structure/minimum-insertions-deletions-to-convert-string/", practice:"https://leetcode.com/problems/delete-operation-for-two-strings/", difficulty:"Medium" },{ title:"Shortest Common Supersequence", yt:"https://youtu.be/xElWj5nLHOY", article:"https://takeuforward.org/data-structure/shortest-common-supersequence/", practice:"https://leetcode.com/problems/shortest-common-supersequence/", difficulty:"Hard" },{ title:"Distinct Subsequences", yt:"https://youtu.be/nVG7eTiD2bY", article:"https://takeuforward.org/data-structure/distinct-subsequences-dp-32/", practice:"https://leetcode.com/problems/distinct-subsequences/", difficulty:"Hard" },{ title:"Edit Distance", yt:"https://youtu.be/qMky6D6YtXU", article:"https://takeuforward.org/data-structure/edit-distance-dp-33/", practice:"https://leetcode.com/problems/edit-distance/", difficulty:"Medium" },{ title:"Wildcard Matching", yt:"https://youtu.be/ZmlQ3vgAOMo", article:"https://takeuforward.org/data-structure/wildcard-matching-dp-34/", practice:"https://leetcode.com/problems/wildcard-matching/", difficulty:"Hard" },{ title:"Interleaving String", practice:"https://leetcode.com/problems/interleaving-string/", difficulty:"Medium" },{ title:"Scramble String", practice:"https://leetcode.com/problems/scramble-string/", difficulty:"Hard" },{ title:"Regular Expression Matching", practice:"https://leetcode.com/problems/regular-expression-matching/", difficulty:"Hard" }
  ]},{ name:"DP on Stocks", problems:[
      { title:"Buy & Sell Stock II (Multiple Transactions)", yt:"https://youtu.be/nGJTWaaFdjc", article:"https://takeuforward.org/data-structure/buy-and-sell-stock-ii-dp-36/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/", difficulty:"Medium" },{ title:"Buy & Sell Stock III (At Most 2 Trans.)", yt:"https://youtu.be/wuzTpONbd-g", article:"https://takeuforward.org/data-structure/buy-and-sell-stocks-iii-dp-37/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/", difficulty:"Hard" },{ title:"Buy & Sell Stock IV (At Most K Trans.)", yt:"https://youtu.be/IV1dHbk5Zm4", article:"https://takeuforward.org/data-structure/buy-and-sell-stocks-iv-dp-38/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/", difficulty:"Hard" },{ title:"Buy & Sell Stock with Cooldown", yt:"https://youtu.be/IGHlN4DXOBM", article:"https://takeuforward.org/data-structure/buy-and-sell-stock-with-cooldown-dp-39/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/", difficulty:"Medium" },{ title:"Buy & Sell Stock with Transaction Fee", yt:"https://youtu.be/pTakjtNMTgs", article:"https://takeuforward.org/data-structure/buy-and-sell-stocks-with-transaction-fee-dp-40/", practice:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/", difficulty:"Medium" },
  ]},{ name:"DP on LIS", problems:[
      { title:"Longest Increasing Subsequence (DP)", yt:"https://youtu.be/ekcwMsSIzVc", article:"https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/", practice:"https://leetcode.com/problems/longest-increasing-subsequence/", difficulty:"Medium" },{ title:"Largest Divisible Subset", yt:"https://youtu.be/gDuZwBW9VvM", article:"https://takeuforward.org/data-structure/largest-divisible-subset-dp-44/", practice:"https://leetcode.com/problems/largest-divisible-subset/", difficulty:"Medium" },{ title:"Longest String Chain", yt:"https://youtu.be/YY8iBaYcc4g", article:"https://takeuforward.org/data-structure/longest-string-chain-dp-45/", practice:"https://leetcode.com/problems/longest-string-chain/", difficulty:"Medium" },{ title:"Longest Bitonic Subsequence", yt:"https://youtu.be/y4vN0WNdrlg", article:"https://takeuforward.org/data-structure/longest-bitonic-subsequence-dp-46/", practice:"https://takeuforward.org/plus" },{ title:"Number of LIS", yt:"https://youtu.be/cKVl1TFdNXg", article:"https://takeuforward.org/data-structure/count-of-lis-dp-47/", practice:"https://leetcode.com/problems/number-of-longest-increasing-subsequence/", difficulty:"Medium" },{ title:"Russian Doll Envelopes", practice:"https://leetcode.com/problems/russian-doll-envelopes/", difficulty:"Hard" },{ title:"Minimum Number of Removals to Make Mountain Array", practice:"https://leetcode.com/problems/minimum-number-of-removals-to-make-mountain-array/", difficulty:"Hard" }
  ]},{ name:"DP on MCM / Partition DP", problems:[
      { title:"Matrix Chain Multiplication (MCM)", yt:"https://youtu.be/pDCXsbAeX4c", article:"https://takeuforward.org/data-structure/matrix-chain-multiplication-dp-48/", practice:"https://takeuforward.org/plus" },{ title:"Minimum Cost to Cut a Stick", yt:"https://youtu.be/xwomavsC86c", article:"https://takeuforward.org/data-structure/minimum-cost-to-cut-the-stick-dp-50/", practice:"https://leetcode.com/problems/minimum-cost-to-cut-a-stick/", difficulty:"Hard" },{ title:"Burst Balloons", yt:"https://youtu.be/Yz4LlDSlkns", article:"https://takeuforward.org/data-structure/burst-balloons-dp-51/", practice:"https://leetcode.com/problems/burst-balloons/", difficulty:"Hard" },{ title:"Evaluate Boolean Expression (True / False ways)", yt:"https://youtu.be/MM7fXopgyjw", article:"https://takeuforward.org/data-structure/evaluate-boolean-expression-to-true-dp-52/", practice:"https://takeuforward.org/plus" },{ title:"Palindrome Partitioning II (Min Cuts)", yt:"https://youtu.be/_H8V5hJUGd0", article:"https://takeuforward.org/data-structure/palindrome-partitioning-ii-front-partition-dp-54/", practice:"https://leetcode.com/problems/palindrome-partitioning-ii/", difficulty:"Hard" },{ title:"Partition Array for Maximum Sum", yt:"https://youtu.be/PhWENd3ggns", article:"https://takeuforward.org/data-structure/partition-array-for-maximum-sum-dp-55/", practice:"https://leetcode.com/problems/partition-array-for-maximum-sum/", difficulty:"Medium" },{ title:"Strange Printer", practice:"https://leetcode.com/problems/strange-printer/", difficulty:"Hard" }
  ]}
]},{ step:17, title:"Tries [Concepts and Problems]", week:8, subtopics:[
  { name:"Theory", problems:[
      { title:"Implement Trie I (Insert, Search, StartsWith)", yt:"https://youtu.be/dBGUmUQhjaM", article:"https://takeuforward.org/data-structure/implement-trie-i/", practice:"https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty:"Medium" },{ title:"Implement Trie II (Count Prefix, Erase)", yt:"https://youtu.be/K5pcpkEMCN0", article:"https://takeuforward.org/data-structure/implement-trie-ii/", practice:"https://takeuforward.org/plus" },
  ]},{ name:"Problems", problems:[
      { title:"Longest String with All Prefixes (Complete String)", yt:"https://youtu.be/AWnBa91lThI", article:"https://takeuforward.org/data-structure/longest-string-with-all-prefixes/", practice:"https://takeuforward.org/plus" },{ title:"Number of Distinct Substrings", yt:"https://youtu.be/RV0QETsfAAo", article:"https://takeuforward.org/data-structure/number-of-distinct-substrings-in-a-string/", practice:"https://takeuforward.org/plus" },{ title:"Maximum XOR with Element from Array", yt:"https://youtu.be/Q8LhG9Pi5KM", article:"https://takeuforward.org/data-structure/maximum-xor-with-an-element-from-array/", practice:"https://leetcode.com/problems/maximum-xor-with-an-element-from-array/", difficulty:"Hard" },{ title:"Word Search II (Trie + Backtracking)", yt:"https://youtu.be/asbcE9mZz_U", article:"https://takeuforward.org/data-structure/word-search-ii/", practice:"https://leetcode.com/problems/word-search-ii/", difficulty:"Hard" },{ title:"Replace Words (Dictionary to Roots)", yt:"https://youtu.be/RV0QETsfAAo", article:"https://takeuforward.org/data-structure/replace-words/", practice:"https://leetcode.com/problems/replace-words/", difficulty:"Medium" },{ title:"Design Add and Search Words Data Structure", yt:"https://youtu.be/BTf05gs_8iU", article:"https://takeuforward.org/data-structure/design-add-search-words-structure/", practice:"https://leetcode.com/problems/design-add-and-search-words-data-structure/", difficulty:"Medium" },{ title:"Palindrome Pairs using Trie", yt:"https://youtu.be/AWnBa91lThI", article:"https://takeuforward.org/data-structure/palindrome-pairs/", practice:"https://leetcode.com/problems/palindrome-pairs/", difficulty:"Hard" },{ title:"Stream of Characters", practice:"https://leetcode.com/problems/stream-of-characters/", difficulty:"Hard" },{ title:"Concatenated Words", practice:"https://leetcode.com/problems/concatenated-words/", difficulty:"Hard" },{ title:"Search Suggestions System", practice:"https://leetcode.com/problems/search-suggestions-system/", difficulty:"Medium" }
  ]}
]},
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
  { id:"coa_01", topic:"Introduction to Computer Organization", week:1, subtopics:"Overview, Von Neumann architecture, basic components", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_02", topic:"Number Systems & Data Representation", week:1, subtopics:"Binary, Octal, Hex, BCD, IEEE 754 floating point", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_03", topic:"Boolean Algebra & Logic Gates", week:1, subtopics:"AND, OR, NOT, NAND, NOR, XOR, truth tables, simplification", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_04", topic:"Combinational Circuits", week:2, subtopics:"Adders, subtractors, multiplexers, demultiplexers, encoders, decoders", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_05", topic:"Sequential Circuits", week:2, subtopics:"Flip-flops (SR, JK, D, T), registers, counters", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_06", topic:"CPU Organisation & Instruction Set", week:3, subtopics:"ALU, control unit, registers, instruction formats, addressing modes", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_07", topic:"Instruction Cycle & Microprogramming", week:3, subtopics:"Fetch-decode-execute, micro-operations, hardwired vs microprogrammed control", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_08", topic:"Pipelining", week:4, subtopics:"Pipeline stages, hazards (structural, data, control), solutions", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_09", topic:"Memory Organisation", week:4, subtopics:"Hierarchy, cache (direct, associative, set-associative), virtual memory, paging", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_10", topic:"Input / Output Organisation", week:5, subtopics:"I/O interfaces, programmed I/O, interrupt-driven I/O, DMA", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_11", topic:"Buses & Interconnects", week:5, subtopics:"Bus structure, synchronous vs asynchronous, arbitration, PCI/PCIe basics", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_12", topic:"Arithmetic Operations in Hardware", week:6, subtopics:"Integer addition/subtraction, multiplication (Booth's), division, floating-point ops", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_13", topic:"RISC vs CISC", week:6, subtopics:"Design philosophy, pipeline friendliness, examples (x86 vs ARM)", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_14", topic:"Parallel Processing", week:7, subtopics:"Flynn's taxonomy, SIMD/MIMD, multiprocessors, cache coherence", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_15", topic:"Performance Metrics & Optimisation", week:7, subtopics:"CPI, MIPS, Amdahl's law, branch prediction, out-of-order execution", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_16", topic:"Assembly Language Basics", week:8, subtopics:"Registers, MOV/ADD/SUB/JMP, stack operations, calling conventions", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },{ id:"coa_17", topic:"Revision & Past Papers", week:8, subtopics:"Previous year questions, formula sheet, Nesa model papers", practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
];

// ─── COA GATE SMASHERS UNITS ──────────────────────────────────────────────────
const COA_GS_PLAYLIST = "PLxCzCOWd7aiHMonh3G6QNKq53C6oNXGrX";
function coaUrl(id, search) {
  if (id) return `https://www.youtube.com/watch?v=${id}&list=${COA_GS_PLAYLIST}`;
  return `https://www.youtube.com/results?search_query=Gate+Smashers+COA+${encodeURIComponent(search)}`;
}
const COA_GS_UNITS = [
  { unit:1, title:"Basic Structure of Computers", videos:[
    { label:"L-1.1",  title:"COA Syllabus Discussion for GATE and UGC NTA NET",       id:"L9X7XXfHYdU" },
    { label:"L-1.2",  title:"Von Neumann's Architecture | Stored Memory Concept",      id:"j8NnE1YeSN0" },
    { label:"L-1.3",  title:"Various General Purpose Registers",                       id:"2mowjC3dCqk" },
    { label:"L-1.4",  title:"Types of Buses (Address, Data and Control)",              id:"xBYhHC8_A6o" },
    { label:"L-1.5",  title:"Instruction Cycle in Computer Organisation",              id:"2mowjC3dCqk" },
    { label:"L-1.6",  title:"Fetch Decode Execute Cycle",                              id:"WAO_W6Hpzyk" },
    { label:"L-1.7",  title:"Types of Instructions in General Purpose Computer",       id:"r6PChksvxp8" },
    { label:"L-1.8",  title:"Instruction Format (Zero, One, Two, Three Address)",      id:"WAO_W6Hpzyk" },
    { label:"L-1.9",  title:"Addressing Modes Introduction",                           id:"_CH4cm5PhK8" },
    { label:"L-1.10", title:"Immediate and Register Addressing Mode",                  id:"PgQIeB-d6HE" },
    { label:"L-1.11", title:"Memory Reference Instructions",                           id:"WAO_W6Hpzyk" },
    { label:"L-1.12", title:"Program Control Instructions (Types of Control Instructions)", id:"OXz7wKHr0_I" },
    { label:"L-1.13", title:"Subroutine Call and Return",                              id:"vXBvjYTi6BY" },
  ]},
  { unit:2, title:"Addressing Modes", videos:[
    { label:"L-2.1",  title:"Register Indirect Addressing Mode",    id:"pqwWQD9Pgjg" },
    { label:"L-2.2",  title:"Displacement / Base Addressing Mode",  id:"Na7sLEioUjU" },
    { label:"L-2.3",  title:"Stack Addressing Mode",                id:"u-sp4gBAJKI" },
    { label:"L-2.4",  title:"Auto Increment Addressing Mode",       id:"7RP8SLdW0S0" },
    { label:"L-2.5",  title:"Auto Decrement Addressing Mode",       id:"7RP8SLdW0S0" },
    { label:"L-2.6",  title:"Auto Increment and Decrement Addressing Modes", id:"7RP8SLdW0S0" },
    { label:"L-2.7",  title:"Direct Addressing Mode",               id:"5A677So9epQ" },
    { label:"L-2.8",  title:"Indirect Addressing Mode",             id:"l7QV6FBTGdE" },
    { label:"L-2.9",  title:"Relative Addressing Mode",             id:"Na7sLEioUjU" },
    { label:"L-2.10", title:"Base Register Addressing Mode",        id:"Bicfyvcp__s" },
    { label:"L-2.11", title:"Indexed Addressing Mode",              id:"18ZVSnz0JcY" },
    { label:"L-2.12", title:"Question on Addressing Modes (UGC NTA NET 2021)", id:"GZz9nz7Vgb0" },
  ]},
  { unit:3, title:"Memory Organization", videos:[
    { label:"L-3.1",  title:"Memory Hierarchy — Access time, Speed, Size, Cost",      id:"zwovvWfkuSg" },
    { label:"L-3.2",  title:"Independent vs Hierarchical Memory Organisation | 2-Level", id:"-B8N9nltt8Q" },
    { label:"L-3.3",  title:"3-Level Memory Organisation",                             id:"3-tT52RzgBs" },
    { label:"L-3.4",  title:"GATE 2004 Question on 3-Level Memory Organisation",       id:"_VNY-nhkMhw" },
    { label:"L-3.5",  title:"Cache Memory Introduction",                               id:"m1dA7D6c3C0" },
    { label:"L-3.6",  title:"Direct Mapping with Example",                             id:"m1dA7D6c3C0" },
    { label:"L-3.7",  title:"Direct Mapping — Numerical",                              id:"eObN3u3eAnU" },
    { label:"L-3.8",  title:"Fully Associative Mapping with Examples",                 id:"sLCJJdz0WAg" },
    { label:"L-3.9",  title:"Advantages and Disadvantages of Direct Mapping",          id:"i7o3sxFk454" },
    { label:"L-3.10", title:"Set Associative Mapping with Examples",                   id:"pFndaJARM4Q" },
    { label:"L-3.11", title:"Locality of Reference in Cache Memory | Spatial vs Temporal", id:"E6QATWzjWZU" },
    { label:"L-3.12", title:"Cache Replacement Algorithms",                            id:"EXRicJapuOQ" },
    { label:"L-3.13", title:"LRU (Least Recently Used) Cache Replacement Algorithm",   id:"w32d1lD0Jb0" },
    { label:"L-3.14", title:"GATE 2014 Question on Set Associative Cache Mapping",     id:"cy7BoO1b66k" },
    { label:"L-3.15", title:"FIFO Cache Replacement Policy",                           id:"e8ZrvrNdp9o" },
    { label:"L-3.16", title:"LRU Cache Replacement Policy (detailed)",                 id:"w32d1lD0Jb0" },
  ]},
  { unit:4, title:"Pipelining", videos:[
    { label:"L-4.1",  title:"Pipelining with Real Life Example | Need of Pipelining",  id:"Al95Owan9Ck" },
    { label:"L-4.2",  title:"Pipelining Introduction and Structure",                   id:"nv0yAm5gc-E" },
    { label:"L-4.3",  title:"Pipelining vs Non-Pipelining | Speedup, Efficiency, Utilization", id:"R9s34-lnd9k" },
    { label:"L-4.4",  title:"Stage Delay in Pipeline | Previous Year GATE Question",   id:"-YtmPoGCdfM" },
    { label:"L-4.5",  title:"Numerical Question on Pipelining | Previous Year GATE",   id:"BlnI-eZSt4M" },
    { label:"L-4.6",  title:"What is Hazard in Pipelining | Types of Hazards",         id:"srlgaJgaxRE" },
    { label:"L-4.7",  title:"Structural Hazards in Pipelining",                        id:"srlgaJgaxRE" },
    { label:"L-4.8",  title:"Control Hazards in Pipelining",                           id:"srlgaJgaxRE" },
    { label:"L-4.9",  title:"Read After Write (RAW) Hazard | Data Hazard in Pipelining", id:"cMKn19y4_9E" },
    { label:"L-4.10", title:"Write After Read (WAR) Hazard | Data Hazards",            id:"PWz5VEMYDP8" },
    { label:"L-4.11", title:"Write After Write (WAW) Hazard | Data Hazards",           id:"-6JjmJNy3nA" },
  ]},
  { unit:5, title:"I/O Organization & Misc", videos:[
    { label:"",       title:"I/O Interface in Computer Organization",                  id:"PM728r4oGcE" },
    { label:"",       title:"Daisy Chaining in Priority Interrupt",                    id:"QvSmbkcmff0" },
    { label:"",       title:"Parallel Priority Interrupt | I/O Organization",          id:"dXOH3Czy5aw" },
    { label:"",       title:"Question on Interrupt Handling | UGC NTA NET June 2021",  id:"-IlIVW1F5dw" },
    { label:"",       title:"Question on DMA (Direct Memory Access) | UGC NTA NET June 2021", id:"qhbgkyi_fbw" },
    { label:"",       title:"RISC vs CISC | Computer Organization & Architecture",     id:"ZW1gb3h-f9k" },
  ]},
];

// ─── WEEK PLAN (8-week roadmap mapping DSA steps to COA weeks) ───────────────
const WEEK_PLAN = [
  { week:1, title:"Basics, Sorting & Arrays (Easy)", dsaSteps:[1,2], coaWeek:1 },{ week:2, title:"Arrays (Medium/Hard) & Strings", dsaSteps:[3], coaWeek:2 },{ week:3, title:"Searching, Recursion & Backtracking", dsaSteps:[4,5], coaWeek:3 },{ week:4, title:"Binary Trees & BST", dsaSteps:[6,7], coaWeek:4 },{ week:5, title:"Linked Lists & Stacks/Queues", dsaSteps:[8,9], coaWeek:5 },{ week:6, title:"Greedy, Binary Search & Heaps", dsaSteps:[10,11], coaWeek:6 },{ week:7, title:"Graphs & Dynamic Programming", dsaSteps:[12,13,14], coaWeek:7 },{ week:8, title:"Advanced DP, Tries & Revision", dsaSteps:[15,16,17], coaWeek:8 },
];

const ALL_REV_TOPICS = [
...STRIVER_STEPS.map(s => ({ id:`rev_dsa_s${s.step}`, topic:`Step ${s.step}: ${s.title}`, type:"DSA", week:s.week,
day:false, week1:false, month:false })),
...COA_TABLE.map(c => ({ id:`rev_${c.id}`, topic:c.topic, type:"COA", week:c.week, day:false, week1:false, month:false
})),
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function useLocalStorage(key, init, migrate) {
const [val, setVal] = useState(() => {
try {
  const s = localStorage.getItem(key);
  if (s) {
    const parsed = JSON.parse(s);
    return migrate ? migrate(parsed) : parsed;
  }
  return typeof init==="function" ? init() : init;
}
catch { return typeof init==="function" ? init() : init; }
});
useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
return [val, setVal];
}

// ─── DATA MIGRATION HELPERS ────────────────────────────────────────────────
// These ensure code updates that add new topics never wipe user progress.
// Fresh table = source of truth for structure; saved data = source of truth for progress.
function mergeDsaData(saved) {
  if (!Array.isArray(saved) || saved.length === 0) return DSA_TABLE;
  const byId = Object.fromEntries(saved.map(d => [d.id, d]));
  return DSA_TABLE.map(fresh => {
    const s = byId[fresh.id];
    if (!s) return fresh;
    return { ...fresh, solved: s.solved ?? 0, confidence: s.confidence ?? 0, revisionRequired: s.revisionRequired ?? false, status: s.status ?? "pending" };
  });
}

function mergeCoaData(saved) {
  if (!Array.isArray(saved) || saved.length === 0) return COA_TABLE;
  const byId = Object.fromEntries(saved.map(d => [d.id, d]));
  return COA_TABLE.map(fresh => {
    const s = byId[fresh.id];
    if (!s) return fresh;
    return { ...fresh, confidence: s.confidence ?? 0, revisionRequired: s.revisionRequired ?? false, status: s.status ?? "pending" };
  });
}

function mergeRevData(saved) {
  if (!Array.isArray(saved) || saved.length === 0) return ALL_REV_TOPICS;
  const byId = Object.fromEntries(saved.map(d => [d.id, d]));
  return ALL_REV_TOPICS.map(fresh => {
    const s = byId[fresh.id];
    if (!s) return fresh;
    return { ...fresh, day: s.day ?? false, week1: s.week1 ?? false, month: s.month ?? false };
  });
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
    function ActivityHeatmap({ activityLog, activeDates }) {
    const [selectedDay, setSelectedDay] = useState(null);
    const [showOther, setShowOther] = useState(false);
    const [otherTab, setOtherTab] = useState("study");
    const [otherSelectedDay, setOtherSelectedDay] = useState(null);
    const safeLog = (activityLog && typeof activityLog === "object" && !Array.isArray(activityLog)) ? activityLog : {};
    const todayDate = new Date();
    const DAYS = ["S","M","T","W","T","F","S"];

    const GREEN_COLORS = ["#161b22","#0e4429","#006d32","#26a641","#39d353"];
    const GREEN_ACCENT = "#39d353";
    const BLUE_COLORS  = ["#161b22","#2d2000","#6b4800","#b45309","#fbbf24"];
    const BLUE_ACCENT  = "#fbbf24";

    const OTHER_TABS = [
        { id:"study", label:"Study Sessions", colors:["#161b22","#0a3d3a","#0f766e","#0d9488","#2dd4bf"], accent:"#2dd4bf" },
        { id:"todo",  label:"To-Do Done",     colors:["#161b22","#2e1065","#5b21b6","#7c3aed","#a78bfa"], accent:"#a78bfa" },
    ];

    const activeDatesSet = useMemo(() => new Set(activeDates || []), [activeDates]);

    function filterDSA(entries) {
        if (!Array.isArray(entries)) return [];
        return entries.filter(e => !e.type || e.type === "dsa");
    }
    function filterOther(entries, type) {
        if (!Array.isArray(entries)) return [];
        return entries.filter(e => e.type === type);
    }

    const cells = [];
    for (let i = 181; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0,10);
        const cnt = filterDSA(safeLog[dateStr] || []).length;
        const source = cnt > 0 ? (activeDatesSet.has(dateStr) ? "lc" : "manual") : "none";
        cells.push({ date: dateStr, count: cnt, dow: d.getDay(), source });
    }
    const firstDow = cells[0].dow;
    const weeks = [];
    let cur = Array(firstDow).fill(null);
    cells.forEach(cell => { cur.push(cell); if (cur.length === 7) { weeks.push(cur); cur = []; } });
    if (cur.length > 0) { while(cur.length < 7) cur.push(null); weeks.push(cur); }

    // Source-aware coloring: LeetCode-confirmed → green, manual checkbox only → blue
    const getCellColorSourced = cell => {
        if (!cell || !cell.count) return GREEN_COLORS[0];
        const pal = cell.source === "lc" ? GREEN_COLORS : BLUE_COLORS;
        if (cell.count === 1) return pal[1]; if (cell.count <= 3) return pal[2]; if (cell.count <= 6) return pal[3]; return pal[4];
    };
    const accentFor = cell => cell?.source === "lc" ? GREEN_ACCENT : BLUE_ACCENT;

    const totalSolved = Object.values(safeLog).reduce((a,v)=>a+filterDSA(v).length, 0);
    const activeDays  = Object.values(safeLog).filter(v=>filterDSA(v).length>0).length;
    const lcDays      = cells.filter(c => c.source === "lc").length;
    const manualDays  = cells.filter(c => c.source === "manual").length;
    const selectedEntries = selectedDay ? filterDSA(safeLog[selectedDay]||[]) : [];
    const selectedSource  = selectedDay ? cells.find(c=>c.date===selectedDay)?.source : null;

    const curOther = OTHER_TABS.find(t=>t.id===otherTab) || OTHER_TABS[0];
    const otherCells = [];
    for (let i = 181; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0,10);
        const cnt = filterOther(safeLog[dateStr] || [], otherTab).length;
        otherCells.push({ date: dateStr, count: cnt, dow: d.getDay(), source: "other" });
    }
    const otherFirstDow = otherCells[0].dow;
    const otherWeeks = [];
    let otherCur = Array(otherFirstDow).fill(null);
    otherCells.forEach(cell => { otherCur.push(cell); if (otherCur.length === 7) { otherWeeks.push(otherCur); otherCur = []; } });
    if (otherCur.length > 0) { while(otherCur.length < 7) otherCur.push(null); otherWeeks.push(otherCur); }
    const getOtherColor = c => {
        const sc = curOther.colors;
        if (!c) return sc[0]; if (c===1) return sc[1]; if (c<=3) return sc[2]; if (c<=6) return sc[3]; return sc[4];
    };
    const otherTotal = Object.values(safeLog).reduce((a,v)=>a+filterOther(v,otherTab).length, 0);
    const otherSelectedEntries = otherSelectedDay ? filterOther(safeLog[otherSelectedDay]||[], otherTab) : [];

    // Generic heat grid; getCellColor(cell) → color string
    const HeatGrid = ({wks, getCellColor, getAccent, legendPalette, accent, selDay, onSelect, label}) => (
        <div style={{overflowX:"auto"}}>
            <div style={{display:"flex",gap:3,marginBottom:3,paddingLeft:20}}>
                {wks.map((_,wi)=>{
                    const first=wks[wi].find(c=>c);
                    const lbl = first ? (() => { const d=new Date(first.date); return d.getDate()<=7 ? d.toLocaleString("default",{month:"short"}) : ""; })() : "";
                    return <div key={wi} style={{width:12,fontSize:9,color:lbl?"#8b949e":"transparent",whiteSpace:"nowrap",overflow:"visible",flexShrink:0}}>{lbl}</div>;
                })}
            </div>
            <div style={{display:"flex",gap:4}}>
                <div style={{display:"flex",flexDirection:"column",gap:3,width:16,flexShrink:0}}>
                    {DAYS.map((d,i)=><div key={i} style={{height:12,fontSize:9,color:i%2===1?"#8b949e":"transparent",lineHeight:"12px",textAlign:"right"}}>{d}</div>)}
                </div>
                {wks.map((week,wi)=>(
                    <div key={wi} style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
                        {week.map((cell,di)=>cell?(
                            <div key={di}
                                onClick={()=>cell.count>0&&onSelect(selDay===cell.date?null:cell.date)}
                                title={`${cell.date}: ${cell.count} ${label}${cell.count!==1?"s":""}${cell.source==="lc"?" · LeetCode API":cell.source==="manual"?" · manual only":""}`}
                                style={{width:12,height:12,borderRadius:2,background:getCellColor(cell),cursor:cell.count>0?"pointer":"default",border:selDay===cell.date?`1.5px solid ${getAccent?getAccent(cell):accent}`:"1px solid transparent",boxSizing:"border-box"}}
                            />
                        ):<div key={di} style={{width:12,height:12}}/>)}
                    </div>
                ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6,paddingLeft:20}}>
                <span style={{fontSize:10,color:"#475569"}}>Less</span>
                {(legendPalette||[GREEN_COLORS[0],GREEN_COLORS[1],GREEN_COLORS[2],GREEN_COLORS[3],GREEN_COLORS[4]]).map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:2,background:c}}/>)}
                <span style={{fontSize:10,color:"#475569"}}>More</span>
            </div>
        </div>
    );

    return <div style={{...S.card, marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={S.sectionTitle}>Activity Calendar</div>
            <div style={{fontSize:11,color:"#475569"}}>{totalSolved} problems · {activeDays} active days</div>
        </div>

        <HeatGrid wks={weeks} getCellColor={getCellColorSourced} getAccent={accentFor} legendPalette={GREEN_COLORS} accent={GREEN_ACCENT} selDay={selectedDay} onSelect={setSelectedDay} label="problem" />

        {/* Source legend */}
        <div style={{display:"flex",alignItems:"center",gap:14,marginTop:8,paddingLeft:20,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:10,height:10,borderRadius:2,background:GREEN_COLORS[3]}}/>
                <span style={{fontSize:10,color:"#64748b"}}>LeetCode API confirmed ({lcDays} days)</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:10,height:10,borderRadius:2,background:BLUE_COLORS[3]}}/>
                <span style={{fontSize:10,color:"#64748b"}}>Manual checkbox only ({manualDays} days)</span>
            </div>
        </div>

        {selectedDay && (
            <div style={{marginTop:12,padding:"12px 14px",background:"#0d1117",borderRadius:8,border:`1px solid #006d3244`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:12,fontWeight:700,color:GREEN_ACCENT}}>{selectedDay}</span>
                    <span style={{fontSize:11,color:"#8b949e"}}>{selectedEntries.length} problem{selectedEntries.length!==1?"s":""} solved</span>
                </div>
                {selectedEntries.length===0 ? (
                    <div style={{fontSize:12,color:"#475569"}}>No LeetCode problems solved here.</div>
                ) : selectedEntries.map((e,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<selectedEntries.length-1?"1px solid #21262d":"none"}}>
                        <span style={{fontSize:11,color:GREEN_ACCENT,fontWeight:700,flexShrink:0}}>◈</span>
                        <span style={{fontSize:13,color:"#e6edf3",flex:1}}>{e.title}</span>
                        <span style={{fontSize:10,color:"#8b949e",flexShrink:0}}>{e.subName||""}</span>
                    </div>
                ))}
            </div>
        )}

        <div style={{marginTop:14,borderTop:"1px solid #1e2030",paddingTop:10}}>
            <button onClick={()=>{setShowOther(p=>!p);setOtherSelectedDay(null);}} style={{
                display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",
                color:"#475569",fontSize:11,fontWeight:600,cursor:"pointer",padding:"2px 0"
            }}>
                <span style={{display:"inline-block",transition:"transform 0.2s",transform:showOther?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                Show other activity (Study Sessions · To-Do)
            </button>

            {showOther && <div style={{marginTop:12}}>
                <div style={{display:"flex",gap:5,marginBottom:12}}>
                    {OTHER_TABS.map(t=><span key={t.id} onClick={()=>{setOtherTab(t.id);setOtherSelectedDay(null);}} style={{
                        padding:"3px 11px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",
                        background: otherTab===t.id ? t.colors[3]+"28" : "transparent",
                        color: otherTab===t.id ? t.accent : "#475569",
                        border:`1px solid ${otherTab===t.id ? t.colors[3]+"66" : "#1e2030"}`,
                        transition:"all 0.15s", userSelect:"none"
                    }}>{t.label}</span>)}
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
                    <span style={{fontSize:11,color:"#475569"}}>{otherTotal} {otherTab==="study"?"sessions":"tasks"} logged</span>
                </div>
                <HeatGrid wks={otherWeeks} getCellColor={c => { if (!c) return curOther.colors[0]; return getOtherColor(c.count); }} getAccent={()=>curOther.accent} legendPalette={curOther.colors} accent={curOther.accent} selDay={otherSelectedDay} onSelect={setOtherSelectedDay} label={otherTab==="study"?"session":"task"} />
                {otherSelectedDay && (
                    <div style={{marginTop:10,padding:"10px 14px",background:"#0d1117",borderRadius:8,border:`1px solid ${curOther.colors[2]}44`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                            <span style={{fontSize:12,fontWeight:700,color:curOther.accent}}>{otherSelectedDay}</span>
                            <span style={{fontSize:11,color:"#8b949e"}}>{otherSelectedEntries.length} {otherTab==="study"?"session":"task"}{otherSelectedEntries.length!==1?"s":""}</span>
                        </div>
                        {otherSelectedEntries.length===0 ? (
                            <div style={{fontSize:12,color:"#475569"}}>Nothing logged here.</div>
                        ) : otherSelectedEntries.map((e,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:i<otherSelectedEntries.length-1?"1px solid #21262d":"none"}}>
                                <span style={{fontSize:11,color:curOther.accent,fontWeight:700,flexShrink:0}}>{otherTab==="study"?"📖":"✓"}</span>
                                <span style={{fontSize:13,color:"#e6edf3",flex:1}}>{e.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>}
        </div>
    </div>;
    }

    function DifficultyDonut({ solvedCounts, totalCounts }) {
        const R = 44, CX = 56, CY = 56, SW = 8;
        const C = 2 * Math.PI * R;
        const totalSolved = (solvedCounts.Easy||0) + (solvedCounts.Medium||0) + (solvedCounts.Hard||0);
        const totalAvail  = (totalCounts.Easy||0)  + (totalCounts.Medium||0)  + (totalCounts.Hard||0);
        const eT = totalAvail > 0 ? C * (totalCounts.Easy||0)   / totalAvail : 0;
        const mT = totalAvail > 0 ? C * (totalCounts.Medium||0) / totalAvail : 0;
        const hT = totalAvail > 0 ? C * (totalCounts.Hard||0)   / totalAvail : 0;
        const eF = totalCounts.Easy   > 0 ? (solvedCounts.Easy||0)   / totalCounts.Easy   * eT : 0;
        const mF = totalCounts.Medium > 0 ? (solvedCounts.Medium||0) / totalCounts.Medium * mT : 0;
        const hF = totalCounts.Hard   > 0 ? (solvedCounts.Hard||0)   / totalCounts.Hard   * hT : 0;
        const seg = (len, start, fillColor, bgColor) => [
            <circle key={bgColor} cx={CX} cy={CY} r={R} fill="none" stroke={bgColor} strokeWidth={SW}
                strokeDasharray={`${len} ${C-len}`} strokeDashoffset={-start}
                style={{transform:`rotate(-90deg)`,transformOrigin:`${CX}px ${CY}px`}}/>,
            len > 0 && <circle key={fillColor} cx={CX} cy={CY} r={R} fill="none" stroke={fillColor} strokeWidth={SW} strokeLinecap="round"
                strokeDasharray={`${len} ${C-len}`} strokeDashoffset={-start}
                style={{transform:`rotate(-90deg)`,transformOrigin:`${CX}px ${CY}px`}}/>
        ];
        return <div style={{display:"flex",alignItems:"center",gap:18}}>
            <div style={{position:"relative",flexShrink:0}}>
                <svg width={112} height={112} viewBox={`0 0 ${CX*2} ${CY*2}`}>
                    <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e2030" strokeWidth={SW}/>
                    {seg(eT, 0,   "#34d399","#0b2a1a")}
                    {seg(mT, eT,  "#fbbf24","#2d1f04")}
                    {seg(hT, eT+mT,"#f87171","#3b0a0a")}
                    {eF>0 && <circle cx={CX} cy={CY} r={R} fill="none" stroke="#34d399" strokeWidth={SW} strokeLinecap="round"
                        strokeDasharray={`${eF} ${C-eF}`} strokeDashoffset={0}
                        style={{transform:`rotate(-90deg)`,transformOrigin:`${CX}px ${CY}px`}}/>}
                    {mF>0 && <circle cx={CX} cy={CY} r={R} fill="none" stroke="#fbbf24" strokeWidth={SW} strokeLinecap="round"
                        strokeDasharray={`${mF} ${C-mF}`} strokeDashoffset={-eT}
                        style={{transform:`rotate(-90deg)`,transformOrigin:`${CX}px ${CY}px`}}/>}
                    {hF>0 && <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f87171" strokeWidth={SW} strokeLinecap="round"
                        strokeDasharray={`${hF} ${C-hF}`} strokeDashoffset={-(eT+mT)}
                        style={{transform:`rotate(-90deg)`,transformOrigin:`${CX}px ${CY}px`}}/>}
                    <text x={CX} y={CY-5} textAnchor="middle" fill="#e2e8f0" fontSize={20} fontWeight={700} fontFamily="DM Sans,sans-serif">{totalSolved}</text>
                    <text x={CX} y={CY+11} textAnchor="middle" fill="#475569" fontSize={9} fontFamily="DM Sans,sans-serif">/ {totalAvail} solved</text>
                </svg>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                    {label:"Easy",   color:"#34d399",bg:"#052e1a",border:"#16533a",s:solvedCounts.Easy||0,  t:totalCounts.Easy||0},{label:"Medium", color:"#fbbf24",bg:"#2d1f04",border:"#78450a",s:solvedCounts.Medium||0,t:totalCounts.Medium||0},{label:"Hard",   color:"#f87171",bg:"#3b0a0a",border:"#7f1d1d",s:solvedCounts.Hard||0,  t:totalCounts.Hard||0},
                ].map(({label,color,bg,border,s,t})=>(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{background:bg,color,border:`1px solid ${border}`,padding:"2px 10px",borderRadius:10,fontSize:10,fontWeight:700,minWidth:52,textAlign:"center",display:"inline-block"}}>{label}</span>
                        <span style={{fontSize:15,fontWeight:700,color:"#e2e8f0",minWidth:24,textAlign:"right"}}>{s}</span>
                        <span style={{fontSize:11,color:"#475569"}}>/ {t}</span>
                    </div>
                ))}
            </div>
        </div>;
    }

    function Dashboard({ dsaData, coaData, weekStatus, streak, streakData, streakFreezes, onApplyFreeze, dailyLog, setDailyLog, activityLog, setActivityLog, diffCounts, diffTotal, solvedQuestions, todos, setTodos, revData }) {
    const [logNote, setLogNote] = useState("");
    const [todayInput, setTodayInput] = useState("");
    const today = new Date().toISOString().slice(0,10);

    function addTodayTask() {
        const text = todayInput.trim();
        if (!text) return;
        setTodos(prev => [{ id: Date.now(), text, priority:4, due:today, project:"Inbox", done:false, createdAt:Date.now() }, ...prev]);
        setTodayInput("");
    }
    function toggleTodayTask(id) {
        setTodos(prev => prev.map(t => t.id===id ? { ...t, done:!t.done } : t));
    }
    function removeTodayTask(id) {
        setTodos(prev => prev.filter(t => t.id!==id));
    }

    const todayTasks = (todos||[]).filter(t => t.due === today);

    const dsaDone = dsaData.filter(d=>d.status==="done").length;
    const coaDone = coaData.filter(d=>d.status==="done").length;
    const totalProblems = useMemo(()=>STRIVER_STEPS.reduce((a,s)=>a+s.subtopics.reduce((b,sub)=>b+sub.problems.length,0),0),[]);
    const solvedProblems = Object.keys(solvedQuestions||{}).length;
    const overallPct = Math.round((dsaDone+coaDone)/(dsaData.length+coaData.length)*100);
    const weeksDone = weekStatus.filter(Boolean).length;

    function addLog() {
    if (!logNote.trim()) return;
    const note = logNote.trim();
    setDailyLog(prev => [{date:today,note,ts:Date.now()},...prev.slice(0,19)]);
    setActivityLog(prev => {
        const dayEntries = prev[today] || [];
        return { ...prev, [today]: [...dayEntries, { title: note, type:"study" }] };
    });
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
        <div style={{...S.pageSub, marginBottom:16}}>SRM KTR · Semester Break · Striver A2Z Sheet ({STRIVER_STEPS.reduce((a,s)=>a+s.subtopics.reduce((b,sub)=>b+sub.problems.length,0),0)} problems) + Nesa COA</div>

        {/* ── Today's Work quick-glance card ── */}
        <div style={{background:"#0f1117", border:"1px solid #1e2030", borderRadius:12, padding:"14px 18px", marginBottom:16}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
                <div style={{fontSize:13, fontWeight:700, color:"#e2e8f0", display:"flex", alignItems:"center", gap:7}}>
                    <span>📋</span> Today's Work
                    <span style={{fontSize:11, color:"#475569", fontWeight:400}}>
                        {todayTasks.filter(t=>t.done).length}/{todayTasks.length} done
                    </span>
                </div>
            </div>
            <div style={{display:"flex", gap:8, marginBottom:todayTasks.length>0?10:0}}>
                <input value={todayInput} onChange={e=>setTodayInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addTodayTask()}
                    placeholder="Add a task for today…"
                    style={{flex:1, padding:"7px 12px", background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:8, color:"#e2e8f0", fontSize:12, outline:"none", fontFamily:"inherit"}} />
                <button onClick={addTodayTask}
                    style={{padding:"7px 14px", background:"#1e1b4b", border:"1px solid #4338ca", borderRadius:8, color:"#a5b4fc", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap"}}>
                    + Add
                </button>
            </div>
            {todayTasks.length > 0 && (
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                    {todayTasks.map(t => (
                        <div key={t.id} style={{display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background:t.done?"#0d2a1a":"#1a1d2e", border:`1px solid ${t.done?"#065f46":"#2d3154"}`, transition:"all 0.15s"}}>
                            <div onClick={()=>toggleTodayTask(t.id)} style={{width:14, height:14, borderRadius:3, border:`1.5px solid ${t.done?"#34d399":"#374151"}`, background:t.done?"#34d399":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0}}>
                                {t.done && <span style={{color:"#000", fontSize:9, fontWeight:900, lineHeight:1}}>✓</span>}
                            </div>
                            <span style={{fontSize:12, color:t.done?"#34d399":"#cbd5e1", textDecoration:t.done?"line-through":"none", cursor:"pointer", userSelect:"none"}} onClick={()=>toggleTodayTask(t.id)}>
                                {t.text}
                            </span>
                            <span onClick={()=>removeTodayTask(t.id)} style={{fontSize:14, color:"#334155", cursor:"pointer", lineHeight:1, marginLeft:2}} onMouseEnter={e=>e.currentTarget.style.color="#f87171"} onMouseLeave={e=>e.currentTarget.style.color="#334155"}>×</span>
                        </div>
                    ))}
                </div>
            )}
            {todayTasks.length === 0 && (
                <div style={{fontSize:12, color:"#334155", fontStyle:"italic"}}>No tasks yet — add something above.</div>
            )}
        </div>

        <div style={S.streakBox}>
            <span style={{fontSize:28}}>🔥</span>
            <div style={{flex:1}}>
                <div style={{fontSize:20,fontWeight:700,color:"#fb923c"}}>{streak} day streak</div>
                <div style={{fontSize:12,color:"#64748b"}}>
                    Best: {streakData?.longestStreak ?? 0}🔥 &nbsp;·&nbsp; LeetCode API is the only source of truth
                </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                {(() => {
                    const today    = getStreakDate();
                    const yesterday = prevDateStr(today);
                    const monthKey = today.slice(0, 7);
                    const validFreezes = (streakFreezes?.month === monthKey ? streakFreezes.used : []);
                    const allActive = new Set([...(streakData?.activeDates || []), ...validFreezes]);
                    const freezesUsed = streakFreezes?.month === monthKey ? (streakFreezes.count || 0) : 0;
                    const freezesLeft = 3 - freezesUsed;
                    // At-risk: yesterday has no activity and no freeze, and streak > 0
                    const yesterdayAtRisk = !allActive.has(yesterday) && streak > 0;
                    // Can retroactively freeze yesterday if we're still before 5AM (i.e. getStreakDate() returned yesterday)
                    const canFreezeYesterday = !allActive.has(yesterday) && !validFreezes.includes(yesterday) && freezesLeft > 0;
                    const canFreezeToday    = !allActive.has(today)     && !validFreezes.includes(today)     && freezesLeft > 0;
                    const showFreeze = (yesterdayAtRisk || canFreezeToday) && freezesLeft > 0;
                    const freezeTarget = !allActive.has(yesterday) && streak > 0 ? yesterday : today;
                    return <>
                        {showFreeze && (
                            <button onClick={() => onApplyFreeze(freezeTarget)}
                                style={{padding:"5px 12px",background:"#0c2233",border:"1px solid #0ea5e9",borderRadius:7,color:"#38bdf8",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                                ❄️ Use Freeze ({freezesLeft} left)
                            </button>
                        )}
                        {!showFreeze && (
                            <span style={{fontSize:11,color:"#334155"}}>❄️ {freezesLeft}/3 freezes this month</span>
                        )}
                    </>;
                })()}
                <div style={{display:"flex",gap:8}}>
                    <input value={logNote} onChange={e=>setLogNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLog()}
                        placeholder="Log today's session…" style={{...S.searchInput,width:200,marginBottom:0}}/>
                    <button onClick={addLog} style={S.btn("primary")}>Log</button>
                </div>
            </div>
        </div>

        <div style={S.grid4} className="rg4">
            <StatCard label="DSA Subtopics" value={`${dsaDone}/${dsaData.length}`}
                pct={Math.round(dsaDone/dsaData.length*100)} color="#818cf8" icon="◈" />
            <StatCard label="Problems Solved" value={`${solvedProblems}/${totalProblems}`}
                pct={Math.round(solvedProblems/totalProblems*100)} color="#60a5fa" icon="✦" />
            <StatCard label="COA Topics" value={`${coaDone}/${coaData.length}`}
                pct={Math.round(coaDone/coaData.length*100)} color="#34d399" icon="◉" />
            <StatCard label="Overall Progress" value={`${overallPct}%`} sub={`${weeksDone}/8 weeks done`}
                pct={overallPct} color="#fb923c" icon="★" />
        </div>

        <div style={{...S.card, marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={S.sectionTitle}>Difficulty Breakdown</div>
                <div style={{fontSize:11,color:"#475569"}}>LeetCode-style progress</div>
            </div>
            <DifficultyDonut solvedCounts={diffCounts} totalCounts={diffTotal}/>
        </div>

        <ActivityHeatmap activityLog={activityLog} />

        <div style={S.grid2} className="rg2">
            <div style={S.card}>
                <div style={S.sectionTitle}>Weekly Progress</div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekChartData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:8,color:"#e2e8f0"}} formatter={v=>[`${v}%`,"Progress"]}/>
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

        <div style={{...S.grid2, gridTemplateColumns:"2fr 1fr"}} className="rg2">
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
        </div>

        <AISuggestions dsaData={dsaData} coaData={coaData} streak={streak} diffCounts={diffCounts} diffTotal={diffTotal} weeksDone={weeksDone} solvedProblems={solvedProblems} totalProblems={totalProblems} solvedQuestions={solvedQuestions} activityLog={activityLog} dailyLog={dailyLog} todos={todos||[]} revData={revData} />
    </div>;
    }

    function AISuggestions({ dsaData, coaData, streak, diffCounts, diffTotal, weeksDone, solvedProblems, totalProblems, solvedQuestions, activityLog, dailyLog, todos, revData }) {
        const today = new Date().toISOString().slice(0,10);

        const A = useMemo(() => {
            const sq = solvedQuestions || {};
            const al = activityLog || {};
            const dsaDone = dsaData.filter(d => d.status === "done").length;
            const dsaTotal = dsaData.length;

            // ── Current step & next subtopic ─────────────────────────────
            let currentStep = null, currentStepDone = 0, currentStepTotal = 0;
            for (const sg of STRIVER_STEPS) {
                const sd = dsaData.filter(d => d.step === sg.step && d.status === "done").length;
                const st = sg.subtopics.length;
                if (sd < st) { currentStep = sg; currentStepDone = sd; currentStepTotal = st; break; }
            }

            let nextSubtopic = null, nextSubtopicUnsolved = [];
            if (currentStep) {
                for (let si = 0; si < currentStep.subtopics.length; si++) {
                    const sub = currentStep.subtopics[si];
                    const unsolved = sub.problems.filter((_, pi) => !sq[`s${currentStep.step}_${si}_${pi}`]);
                    if (unsolved.length > 0) { nextSubtopic = sub; nextSubtopicUnsolved = unsolved; break; }
                }
            }

            // ── Spotlight: first unsolved LeetCode problem in current step ──
            let spotlight = null;
            if (currentStep) {
                outer: for (let si = 0; si < currentStep.subtopics.length; si++) {
                    for (let pi = 0; pi < currentStep.subtopics[si].problems.length; pi++) {
                        const p = currentStep.subtopics[si].problems[pi];
                        if (!sq[`s${currentStep.step}_${si}_${pi}`] && p.practice?.includes("leetcode")) {
                            spotlight = { ...p, subName: currentStep.subtopics[si].name };
                            break outer;
                        }
                    }
                }
            }

            // ── Velocity from activity log ────────────────────────────────
            const logDates = Object.keys(al).filter(d => (al[d]||[]).length > 0).sort();
            let subtopicsPerDay = 0, firstDate = null, daysTracked = 0;
            if (logDates.length > 0) {
                firstDate = logDates[0];
                const ms = new Date(today) - new Date(firstDate);
                daysTracked = Math.max(1, Math.round(ms / 86400000) + 1);
                subtopicsPerDay = dsaDone > 0 ? parseFloat((dsaDone / daysTracked).toFixed(1)) : 0;
            }
            const effectiveRate = Math.max(subtopicsPerDay, 0.1);
            const daysLeftCurrent = currentStep ? Math.ceil((currentStepTotal - currentStepDone) / 2) : 0;
            const daysLeftAll = Math.ceil((dsaTotal - dsaDone) / effectiveRate);
            const finishDateObj = new Date(); finishDateObj.setDate(finishDateObj.getDate() + daysLeftAll);
            const finishDate = finishDateObj.toLocaleDateString("en-IN", { day:"numeric", month:"short" });

            // ── This-week activity grid ───────────────────────────────────
            const weekGrid = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const ds = d.toISOString().slice(0,10);
                const dow = d.getDay();
                weekGrid.push({ date: ds, count: (al[ds]||[]).length, label: ["S","M","T","W","T","F","S"][dow] });
            }
            const activeThisWeek = weekGrid.filter(d => d.count > 0).length;

            // ── Difficulty pcts ───────────────────────────────────────────
            const easyPct = diffTotal.Easy ? Math.round(diffCounts.Easy / diffTotal.Easy * 100) : 0;
            const medPct  = diffTotal.Medium ? Math.round(diffCounts.Medium / diffTotal.Medium * 100) : 0;
            const hardPct = diffTotal.Hard ? Math.round(diffCounts.Hard / diffTotal.Hard * 100) : 0;

            // ── COA ───────────────────────────────────────────────────────
            const nextCoa = coaData.find(c => c.status !== "done");
            const coaDone = coaData.filter(c => c.status === "done").length;
            const coaTotal = coaData.length;

            // ── Revision cadence gaps ─────────────────────────────────────
            const pendingWeekReview  = (revData || []).filter(d => d.day && !d.week1);
            const pendingMonthReview = (revData || []).filter(d => d.week1 && !d.month);
            const pendingDayReview   = (revData || []).filter(d => !d.day);

            // ── Difficulty strategy advice ────────────────────────────────
            let diffAdvice = "";
            if (solvedProblems < 15) diffAdvice = "Solve 1 Easy per day first — build pattern recognition before jumping to harder problems.";
            else if (easyPct > 60 && medPct < 25) diffAdvice = `You've cleared ${diffCounts.Easy} Easy but only ${diffCounts.Medium} Medium. Shift to 2 Mediums per 1 Easy — interviews live here.`;
            else if (medPct > 45 && hardPct < 12) diffAdvice = `Solid Medium base (${diffCounts.Medium} solved). Add 1 Hard/week — they compound your pattern range fast.`;
            else if (hardPct > 20) diffAdvice = "Strong across all tiers. Focus on speed now — practice solving each problem in under 25 minutes.";
            else diffAdvice = `Balanced: ${diffCounts.Easy}E · ${diffCounts.Medium}M · ${diffCounts.Hard}H. Keep this ratio and aim for 2 new problems daily.`;

            // ── Streak advice ─────────────────────────────────────────────
            let streakAdvice = "";
            if (streak === 0) streakAdvice = "No active streak. Solving even 1 problem today starts it — 15 minutes is enough.";
            else if (streak < 5) streakAdvice = `${streak}-day streak. Don't break it — ${5 - streak} more days to your first milestone.`;
            else if (streak < 14) streakAdvice = `${streak}-day streak! ${14 - streak} more days → 2-week habit lock-in. That's when consistency becomes automatic.`;
            else streakAdvice = `${streak}-day streak — exceptional. You're building a skill that compounds for years.`;

            // ── To-Do stats (reactive to task completion) ─────────────────
            const td = todos || [];
            const todoDoneToday  = td.filter(t => t.done && t.due === today);
            const todoDoneTotal  = td.filter(t => t.done);
            const todoOpenTotal  = td.filter(t => !t.done);
            const todoDueToday   = td.filter(t => !t.done && t.due === today);
            const todoOverdue    = td.filter(t => !t.done && t.due && t.due < today);
            const recentDone     = [...todoDoneTotal]
                .sort((a,b) => (b.createdAt||0) - (a.createdAt||0))
                .slice(0, 3);
            let todoAdvice = "";
            if (todoOverdue.length > 0) todoAdvice = `${todoOverdue.length} overdue task${todoOverdue.length!==1?"s":""} need attention — reschedule or complete them first.`;
            else if (todoDueToday.length > 0) todoAdvice = `${todoDueToday.length} task${todoDueToday.length!==1?"s":""} due today — knock them out before your DSA session.`;
            else if (todoOpenTotal.length === 0 && todoDoneTotal.length > 0) todoAdvice = "All tasks done! Add new study goals to keep momentum going.";
            else if (todoDoneToday.length > 0) todoAdvice = `${todoDoneToday.length} task${todoDoneToday.length!==1?"s":""} completed today — great execution. Keep the energy up.`;
            else todoAdvice = "No tasks completed today yet. Even one small task builds momentum.";

            return { currentStep, currentStepDone, currentStepTotal, nextSubtopic, nextSubtopicUnsolved,
                     spotlight, subtopicsPerDay, firstDate, daysLeftCurrent, daysLeftAll, finishDate,
                     weekGrid, activeThisWeek, easyPct, medPct, hardPct, nextCoa, coaDone, coaTotal,
                     diffAdvice, streakAdvice, dsaDone, dsaTotal,
                     todoDoneToday, todoDoneTotal, todoOpenTotal, todoDueToday, todoOverdue, recentDone, todoAdvice,
                     pendingWeekReview, pendingMonthReview, pendingDayReview };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dsaData, coaData, solvedQuestions, activityLog, diffCounts, diffTotal, solvedProblems, todos, today, revData]);

        const { currentStep, currentStepDone, currentStepTotal, nextSubtopic, nextSubtopicUnsolved,
                spotlight, subtopicsPerDay, firstDate, daysLeftCurrent, daysLeftAll, finishDate,
                weekGrid, activeThisWeek, easyPct, medPct, hardPct, nextCoa, coaDone, coaTotal,
                diffAdvice, streakAdvice, dsaDone, dsaTotal,
                todoDoneToday, todoDoneTotal, todoOpenTotal, todoDueToday, todoOverdue, recentDone, todoAdvice,
                pendingWeekReview, pendingMonthReview, pendingDayReview } = A;

        const recentCount = ((activityLog || {})[today] || []).filter(e => e.type === "dsa").length;

        return <div style={{...S.card, marginTop:16}}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <span style={{fontSize:18}}>🤖</span>
                <span style={S.sectionTitle}>AI Coach</span>
                <span style={{fontSize:11,color:"#475569"}}>— Personalized to your progress</span>
                <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
                    {recentCount > 0 && <span style={{fontSize:10,color:"#34d399",background:"#052e1a",padding:"2px 8px",borderRadius:10,border:"1px solid #16533a",marginRight:6}}>{recentCount} solved today</span>}
                    <span style={{width:6,height:6,borderRadius:"50%",background:"#34d399",display:"inline-block",boxShadow:"0 0 6px #34d399"}}/>
                    <span style={{fontSize:10,color:"#475569"}}>Live analysis</span>
                </div>
            </div>

            {/* TODAY'S ACTION PLAN banner */}
            <div style={{background:"#060e1a",border:"1px solid #1e3a5f",borderLeft:"3px solid #60a5fa",borderRadius:10,padding:"14px 18px",marginBottom:14}}>
                <div style={{fontSize:10,color:"#60a5fa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>📋 Today's Action Plan</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                    <div>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>DSA — do this now</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:3,lineHeight:1.35}}>
                            {nextSubtopic ? nextSubtopic.name : currentStep ? `Finish Step ${currentStep.step}` : "🎉 All steps done!"}
                        </div>
                        {nextSubtopicUnsolved.length > 0 && <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>
                            Solve: <span style={{color:"#94a3b8"}}>{nextSubtopicUnsolved.slice(0,2).map(p=>p.title).join(", ")}</span>
                            {nextSubtopicUnsolved.length > 2 && <span style={{color:"#475569"}}> +{nextSubtopicUnsolved.length-2} more</span>}
                        </div>}
                    </div>
                    <div>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>COA — study next</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:3,lineHeight:1.35}}>
                            {nextCoa ? nextCoa.topic : "COA Complete ✓"}
                        </div>
                        {nextCoa && <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>{nextCoa.subtopics?.slice(0,55)}{nextCoa.subtopics?.length>55?"…":""}</div>}
                    </div>
                    <div>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>Suggested time split</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:3}}>2 h DSA · 45 min COA</div>
                        <div style={{fontSize:10,color:"#64748b"}}>
                            {currentStep ? `${currentStepTotal - currentStepDone} subtopics left in Step ${currentStep.step}` : "Move to revision mode"}
                        </div>
                    </div>
                </div>
            </div>

            {/* 6-card grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>

                {/* 1 – Current Step */}
                <div style={{background:"#0a0b0d",border:"1px solid #818cf828",borderLeft:"3px solid #818cf8",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontSize:13}}>📌</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#818cf8",textTransform:"uppercase",letterSpacing:"0.07em"}}>Current Step</span>
                    </div>
                    {currentStep ? <>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:2,lineHeight:1.35}}>Step {currentStep.step}: {currentStep.title}</div>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:6}}>{currentStepDone}/{currentStepTotal} subtopics done</div>
                        <PBar pct={currentStepTotal ? Math.round(currentStepDone/currentStepTotal*100) : 0} color="#818cf8" height={4}/>
                        <div style={{marginTop:8,fontSize:10,color:"#94a3b8"}}>
                            ~<span style={{color:"#818cf8",fontWeight:700}}>{daysLeftCurrent} day{daysLeftCurrent!==1?"s":""}</span> to finish at 2/day
                        </div>
                        {nextSubtopic && <div style={{marginTop:6,padding:"5px 8px",background:"#0d0e20",borderRadius:6,fontSize:10,color:"#a78bfa",lineHeight:1.4}}>
                            Next up: <strong>{nextSubtopic.name}</strong>
                        </div>}
                    </> : <div style={{fontSize:12,color:"#34d399",fontWeight:700,lineHeight:1.6}}>All {dsaTotal} subtopics complete! 🏆<br/><span style={{fontSize:10,color:"#475569",fontWeight:400}}>Focus on contests and revision.</span></div>}
                </div>

                {/* 2 – Pace & ETA */}
                <div style={{background:"#0a0b0d",border:"1px solid #34d39928",borderLeft:"3px solid #34d399",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontSize:13}}>⚡</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#34d399",textTransform:"uppercase",letterSpacing:"0.07em"}}>Your Pace</span>
                    </div>
                    {firstDate ? <>
                        <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2}}>
                            <span style={{fontSize:26,fontWeight:800,color:"#e2e8f0",lineHeight:1}}>{subtopicsPerDay}</span>
                            <span style={{fontSize:10,color:"#475569"}}>subtopics/day avg</span>
                        </div>
                        <div style={{fontSize:10,color:"#475569",marginBottom:8}}>tracked since {firstDate} · {dsaDone} done total</div>
                        <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>
                            Sheet finish: <span style={{color:"#34d399",fontWeight:700}}>{finishDate}</span>
                            <span style={{color:"#475569"}}> ({daysLeftAll}d left)</span>
                        </div>
                        <div style={{fontSize:10,padding:"4px 8px",borderRadius:6,
                            background: subtopicsPerDay >= 2 ? "#052e1a" : subtopicsPerDay >= 1 ? "#2d1f04" : "#3b0a0a",
                            color: subtopicsPerDay >= 2 ? "#34d399" : subtopicsPerDay >= 1 ? "#fbbf24" : "#f87171",
                            border: `1px solid ${subtopicsPerDay >= 2 ? "#16533a" : subtopicsPerDay >= 1 ? "#78450a" : "#7f1d1d"}`
                        }}>
                            {subtopicsPerDay >= 2 ? "✓ On track for 8-week plan" : subtopicsPerDay >= 1 ? "⚠ Slightly behind — push to 2/day" : "⚠ Speed up to hit your deadline"}
                        </div>
                    </> : <>
                        <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>No sessions logged yet</div>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:8}}>At 2/day → finish in ~{Math.ceil(dsaTotal/2)} days ({new Date(Date.now()+Math.ceil(dsaTotal/2)*86400000).toLocaleDateString("en-IN",{day:"numeric",month:"short"})})</div>
                        <div style={{fontSize:10,color:"#60a5fa"}}>↑ Log your first session above to track real pace</div>
                    </>}
                </div>

                {/* 3 – This Week */}
                <div style={{background:"#0a0b0d",border:"1px solid #f9731628",borderLeft:"3px solid #f97316",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontSize:13}}>🔥</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:"0.07em"}}>This Week</span>
                    </div>
                    <div style={{display:"flex",gap:3,marginBottom:8}}>
                        {weekGrid.map((d,i) => {
                            const isToday = d.date === today;
                            const intensity = d.count === 0 ? 0 : d.count < 3 ? 1 : d.count < 6 ? 2 : 3;
                            const bg = ["#0f1117","#431407","#7c2d12","#c2410c"][intensity];
                            return <div key={i} style={{flex:1,textAlign:"center"}}>
                                <div style={{fontSize:8,color:isToday?"#f97316":"#334155",marginBottom:3,fontWeight:isToday?700:400}}>{d.label}</div>
                                <div style={{height:22,borderRadius:4,background:bg,border:`1px solid ${isToday?"#f97316":"#1e2030"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    {d.count > 0 && <span style={{fontSize:7,color:"#fed7aa",fontWeight:700}}>{d.count}</span>}
                                </div>
                            </div>;
                        })}
                    </div>
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:4}}>
                        <span style={{color:streak>5?"#34d399":streak>0?"#f97316":"#ef4444",fontWeight:700}}>{streak}🔥 streak</span>
                    </div>
                    <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>{streakAdvice}</div>
                </div>

                {/* 4 – Problem Spotlight */}
                <div style={{background:"#0a0b0d",border:"1px solid #60a5fa28",borderLeft:"3px solid #60a5fa",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontSize:13}}>🎯</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#60a5fa",textTransform:"uppercase",letterSpacing:"0.07em"}}>Solve Next</span>
                    </div>
                    {spotlight ? <>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:2,lineHeight:1.35}}>{spotlight.title}</div>
                        <div style={{fontSize:10,color:"#475569",marginBottom:6}}>{spotlight.subName} · Step {currentStep?.step}</div>
                        {spotlight.difficulty && <span style={{
                            fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,marginBottom:8,display:"inline-block",
                            background:spotlight.difficulty==="Easy"?"#052e1a":spotlight.difficulty==="Medium"?"#2d1f04":"#3b0a0a",
                            color:spotlight.difficulty==="Easy"?"#34d399":spotlight.difficulty==="Medium"?"#fbbf24":"#f87171",
                        }}>{spotlight.difficulty}</span>}
                        <div style={{display:"flex",gap:6,marginTop:8}}>
                            {spotlight.practice && <a href={spotlight.practice} target="_blank" rel="noreferrer"
                                style={{fontSize:10,color:"#60a5fa",textDecoration:"none",padding:"3px 10px",borderRadius:5,border:"1px solid #1e3a5f",background:"#060e1a"}}>LeetCode ↗</a>}
                            {spotlight.yt && <a href={spotlight.yt} target="_blank" rel="noreferrer"
                                style={{fontSize:10,color:"#ef4444",textDecoration:"none",padding:"3px 10px",borderRadius:5,border:"1px solid #3b0a0a",background:"#0a0405"}}>YouTube ↗</a>}
                        </div>
                    </> : <div style={{fontSize:12,color:"#34d399",fontWeight:600}}>All tracked LeetCode problems done! 🎉</div>}
                </div>

                {/* 5 – Difficulty Strategy */}
                <div style={{background:"#0a0b0d",border:"1px solid #fbbf2428",borderLeft:"3px solid #fbbf24",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontSize:13}}>📊</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#fbbf24",textTransform:"uppercase",letterSpacing:"0.07em"}}>Difficulty Mix</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
                        {[
                            {label:"Easy",   pct:easyPct, done:diffCounts.Easy,   total:diffTotal.Easy,   color:"#34d399"},{label:"Medium", pct:medPct,  done:diffCounts.Medium, total:diffTotal.Medium, color:"#fbbf24"},{label:"Hard",   pct:hardPct, done:diffCounts.Hard,   total:diffTotal.Hard,   color:"#f87171"},
                        ].map(r => <div key={r.label}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                                <span style={{color:r.color,fontWeight:600}}>{r.label}</span>
                                <span style={{color:"#475569"}}>{r.done}/{r.total} — {r.pct}%</span>
                            </div>
                            <PBar pct={r.pct} color={r.color} height={4}/>
                        </div>)}
                    </div>
                    <div style={{fontSize:10,color:"#94a3b8",lineHeight:1.5}}>{diffAdvice}</div>
                </div>

                {/* 6 – COA Focus */}
                <div style={{background:"#0a0b0d",border:"1px solid #a78bfa28",borderLeft:"3px solid #a78bfa",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontSize:13}}>📖</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.07em"}}>COA Next Up</span>
                    </div>
                    {nextCoa ? <>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:3,lineHeight:1.35}}>{nextCoa.topic}</div>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:8,lineHeight:1.5}}>{nextCoa.subtopics}</div>
                        <div style={{marginBottom:6}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginBottom:3}}>
                                <span>Overall COA</span>
                                <span style={{color:"#a78bfa"}}>{coaDone}/{coaTotal} done</span>
                            </div>
                            <PBar pct={coaTotal ? Math.round(coaDone/coaTotal*100) : 0} color="#a78bfa" height={4}/>
                        </div>
                        <div style={{fontSize:10,padding:"4px 8px",borderRadius:6,background:"#160d2a",color:"#c4b5fd",border:"1px solid #3b1f6b"}}>
                            Week {nextCoa.week} · Target: {nextCoa.practiceTarget} practice problems
                        </div>
                    </> : <div style={{fontSize:12,color:"#34d399",fontWeight:700,lineHeight:1.6}}>All COA topics complete! 🎓<br/><span style={{fontSize:10,color:"#475569",fontWeight:400}}>Review past papers for exam prep.</span></div>}
                </div>

                {/* 7 – To-Do Progress (live, updates on every task completion) */}
                <div style={{background:"#0a0b0d",border:`1px solid ${todoOverdue.length>0?"#ef444428":todoDoneToday.length>0?"#34d39928":"#fb923c28"}`,borderLeft:`3px solid ${todoOverdue.length>0?"#ef4444":todoDoneToday.length>0?"#34d399":"#fb923c"}`,borderRadius:8,padding:"12px 14px",gridColumn:"1 / -1"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                        <span style={{fontSize:13}}>✅</span>
                        <span style={{fontSize:10,fontWeight:700,color:todoOverdue.length>0?"#ef4444":todoDoneToday.length>0?"#34d399":"#fb923c",textTransform:"uppercase",letterSpacing:"0.07em"}}>To-Do Progress</span>
                        <span style={{fontSize:10,color:"#334155",background:"#0d0f18",padding:"1px 8px",borderRadius:10,border:"1px solid #1e2030",marginLeft:4}}>updates live as you complete tasks</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,alignItems:"start"}}>
                        {/* Stats column */}
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {[
                                {label:"Done today",  val:todoDoneToday.length,  color:"#34d399"},{label:"Open tasks",  val:todoOpenTotal.length,  color:"#60a5fa"},{label:"Overdue",     val:todoOverdue.length,    color: todoOverdue.length>0?"#ef4444":"#475569"},{label:"Total done",  val:todoDoneTotal.length,  color:"#818cf8"},
                            ].map(s => <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:10,color:"#475569"}}>{s.label}</span>
                                <span style={{fontSize:14,fontWeight:700,color:s.color}}>{s.val}</span>
                            </div>)}
                        </div>
                        {/* Today's due tasks */}
                        <div>
                            <div style={{fontSize:10,color:"#475569",marginBottom:6,fontWeight:600}}>Due today</div>
                            {todoDueToday.length > 0
                                ? todoDueToday.slice(0,4).map((t,i) => <div key={i} style={{fontSize:10,color:"#fbbf24",padding:"3px 0",borderBottom:"1px solid #1e2030",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</div>)
                                : <div style={{fontSize:10,color:"#334155",fontStyle:"italic"}}>None due today</div>}
                        </div>
                        {/* Recently completed */}
                        <div>
                            <div style={{fontSize:10,color:"#475569",marginBottom:6,fontWeight:600}}>Recently completed</div>
                            {recentDone.length > 0
                                ? recentDone.map((t,i) => <div key={i} style={{fontSize:10,color:"#34d399",padding:"3px 0",borderBottom:"1px solid #1e2030",display:"flex",alignItems:"center",gap:5}}>
                                    <span style={{color:"#16a34a",fontSize:9}}>✓</span>
                                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{t.text}</span>
                                  </div>)
                                : <div style={{fontSize:10,color:"#334155",fontStyle:"italic"}}>No tasks completed yet</div>}
                        </div>
                        {/* Coach advice */}
                        <div style={{padding:"10px 12px",background:"#060e1a",borderRadius:8,border:`1px solid ${todoOverdue.length>0?"#7f1d1d":todoDoneToday.length>0?"#16533a":"#78450a"}`}}>
                            <div style={{fontSize:10,color:"#475569",marginBottom:5,fontWeight:600}}>Coach says</div>
                            <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.55}}>{todoAdvice}</div>
                        </div>
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

    function DSATracker({ dsaData, setDsaData, setDailyLog, lastLogDate, setActivityLog, solvedQuestions, setSolvedQuestions, probNotes, setProbNotes, revStars, setRevStars }) {
    const [search, setSearch] = useState("");
    const [expandedStep, setExpandedStep] = useState(null);
    const [expandedSub, setExpandedSub] = useState(null);
    const [diffFilter, setDiffFilter] = useState("All");
    const [activeNote, setActiveNote] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [noteIsEditing, setNoteIsEditing] = useState(false);
    const [lcSyncing, setLcSyncing] = useState(false);
    const [lcSyncMsg, setLcSyncMsg] = useState("");
    const [lcUsername, setLcUsername] = useLocalStorage("lc_username", "");

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
        if (!lcUsername || !lcUsername.trim()) {
            setLcSyncMsg("⚠ Please enter your LeetCode username.");
            return;
        }
        setLcSyncing(true);
        setLcSyncMsg("Fetching your LeetCode submissions…");
        try {
            // Use our own Vercel proxy → calls LeetCode GraphQL server-side (no CORS / rate-limit issues)
            const res = await fetch(`/api/leetcode/${encodeURIComponent(lcUsername.trim())}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            const data = await res.json();

            // Build slug -> earliest accepted date map (real submission date, not sync date)
            const slugToDate = {};
            (data.submissions || []).forEach(s => {
                if (!s.titleSlug || !s.timestamp) return;
                const date = new Date(parseInt(s.timestamp) * 1000).toISOString().slice(0, 10);
                // Keep earliest date so the calendar shows when it was first solved
                if (!slugToDate[s.titleSlug] || date < slugToDate[s.titleSlug]) {
                    slugToDate[s.titleSlug] = date;
                }
            });

            const accepted = new Set(Object.keys(slugToDate));
            const newSolved = { ...solvedQuestions };
            // Group newly solved problems by their real submission date
            const newlySolvedByDate = {};
            const updateActivityDates = {};

            STRIVER_STEPS.forEach(sg => {
                sg.subtopics.forEach((sub, si) => {
                    sub.problems.forEach((p, pi) => {
                        if (p.practice && p.practice.includes("leetcode.com/problems/")) {
                            const slug = p.practice.replace(/\/$/, "").split("/problems/")[1]?.split("/")[0];
                            if (slug && accepted.has(slug)) {
                                const realDate = slugToDate[slug];
                                const key = `s${sg.step}_${si}_${pi}`;

                                if (!newSolved[key]) {
                                    newSolved[key] = true;
                                    const date = realDate || new Date().toISOString().slice(0, 10);
                                    if (!newlySolvedByDate[date]) newlySolvedByDate[date] = [];
                                    newlySolvedByDate[date].push({ title: p.title, stepTitle: sg.title, subName: sub.name, type: "dsa" });
                                } else if (realDate) {
                                    // If already solved, move it to the correct date from LeetCode
                                    updateActivityDates[p.title + "|" + sub.name] = {
                                        realDate,
                                        prob: { title: p.title, stepTitle: sg.title, subName: sub.name, type: "dsa" }
                                    };
                                }
                            }
                        }
                    });
                });
            });

            const count = Object.values(newlySolvedByDate).reduce((a, v) => a + v.length, 0);
            const moveCount = Object.keys(updateActivityDates).length;
            setSolvedQuestions(newSolved);
            recomputeDsaData(newSolved);

            if (count > 0 || moveCount > 0) {
                const today = new Date().toISOString().slice(0, 10);
                
                setActivityLog(prev => {
                    const updated = {};
                    
                    // First pass: copy prev but remove items that need to be moved to a different date
                    for (const [date, probs] of Object.entries(prev)) {
                        const filtered = probs.filter(p => {
                            const k = p.title + "|" + p.subName;
                            // Remove if it's scheduled to be moved to a NEW date
                            if (updateActivityDates[k] && updateActivityDates[k].realDate !== date) return false;
                            return true;
                        });
                        if (filtered.length > 0) updated[date] = filtered;
                    }

                    // Add newly solved problems
                    Object.entries(newlySolvedByDate).forEach(([date, problems]) => {
                        const dayProbs = updated[date] || [];
                        const existing = new Set(dayProbs.map(p => p.title + "|" + p.subName));
                        const toAdd = problems.filter(p => !existing.has(p.title + "|" + p.subName));
                        if (toAdd.length > 0) updated[date] = [...dayProbs, ...toAdd];
                    });

                    // Add moved problems to their correct realDate
                    for (const { realDate, prob } of Object.values(updateActivityDates)) {
                        const dayProbs = updated[realDate] || [];
                        const existing = new Set(dayProbs.map(p => p.title + "|" + p.subName));
                        if (!existing.has(prob.title + "|" + prob.subName)) {
                            updated[realDate] = [...dayProbs, prob];
                        }
                    }

                    return updated;
                });
                
                if (count > 0) {
                    setDailyLog(logs => {
                        if (logs.length > 0 && logs[0].date === today) return logs;
                        return [{ date: today, note: `Synced ${count} problem${count !== 1 ? "s" : ""} from LeetCode`, ts: Date.now() }, ...logs.slice(0, 19)];
                    });
                }
            }
            // ── Streak: mark today active if LeetCode confirms any submission today ──
            const streakToday = getStreakDate();
            const solvedOnToday = Object.values(slugToDate).some(d => d === streakToday);
            if (solvedOnToday) markDateActive(streakToday);

            setLcSyncMsg(`✓ ${count} new problem${count !== 1 ? "s" : ""} synced!`);
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
            const stepData = STRIVER_STEPS.find(s => s.step === stepNum);
            const subData = stepData?.subtopics[subIdx];
            const prob = subData?.problems[probIdx];
            const probTitle = prob?.title || "Unknown";
            const stepTitle = stepData?.title || `Step ${stepNum}`;
            const subName = subData?.name || "Unknown";
            if (isSolved) {
                // Add to activity log (calendar heatmap)
                const today = new Date().toISOString().slice(0,10);
                setActivityLog(prev => {
                    const dayProbs = prev[today] || [];
                    if (dayProbs.find(p => p.title === probTitle && p.subName === subName)) return prev;
                    return { ...prev, [today]: [...dayProbs, { title: probTitle, stepTitle, subName, type:"dsa" }] };
                });
                if (lastLogDate !== today) {
                    setDailyLog(logs => {
                        if (logs.length > 0 && logs[0].date === today) return logs;
                        return [{ date: today, note: `Solved problems in DSA tracker`, ts: Date.now() }, ...logs.slice(0, 19)];
                    });
                }
            } else {
                // Remove from activity log across ALL days when unchecking
                setActivityLog(prev => {
                    const updated = {};
                    for (const [date, probs] of Object.entries(prev)) {
                        const filtered = probs.filter(p => !(p.title === probTitle && p.subName === subName));
                        if (filtered.length > 0) updated[date] = filtered;
                    }
                    return updated;
                });
            }
            return next;
        });
    }

    const totalProblems = useMemo(()=>STRIVER_STEPS.reduce((a,s)=>a+s.subtopics.reduce((b,sub)=>b+sub.problems.length,0),0),[]);
    const solvedProbs = Object.keys(solvedQuestions||{}).length;
    const doneSubs = dsaData.filter(d=>d.status==="done").length;

    function toggleStar(key) {
        setRevStars(prev => ({ ...prev, [key]: !prev[key] }));
    }

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

    const TH = {padding:"9px 14px", color:"#475569", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", textAlign:"center", borderBottom:"1px solid #1e2030", whiteSpace:"nowrap"};
    const TD = {padding:"11px 14px", borderBottom:"1px solid #13151f", verticalAlign:"middle"};
    const DIFF_BADGE = {
        Easy:   { background:"#052e1a", color:"#34d399", border:"1px solid #16533a" },
        Medium: { background:"#2d1f04", color:"#fbbf24", border:"1px solid #78450a" },
        Hard:   { background:"#3b0a0a", color:"#f87171", border:"1px solid #7f1d1d" },
    };

    return <div>
        <div style={S.pageTitle}>DSA Tracker</div>
        <div style={{...S.pageSub,marginBottom:12}}>Striver A2Z · 17 Steps · {solvedProbs}/{totalProblems} problems solved · {doneSubs}/{dsaData.length} subtopics done</div>
        <PBar pct={totalProblems ? Math.round(solvedProbs/totalProblems*100) : 0} color="#818cf8" height={5} />
        <div style={{marginBottom:16}} />

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
            {[
                {l:"Total Problems", v:totalProblems, c:"#818cf8"},{l:"Solved",         v:solvedProbs,   c:"#34d399"},{l:"Subtopics Done", v:doneSubs,      c:"#60a5fa"},{l:"Completion",     v:`${totalProblems ? Math.round(solvedProbs/totalProblems*100) : 0}%`, c:"#fb923c"}
            ].map((s,i)=>
            <div key={i} style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:10,padding:"12px 14px"}}>
                <div style={S.statLabel}>{s.l}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
            )}
        </div>

        <div style={{...S.filterBar, flexWrap:"wrap", gap:8, marginBottom:16}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search steps or subtopics…" style={{...S.searchInput, flex:1, minWidth:180}}/>
            <div style={{display:"flex", gap:4}}>
                {[
                    {d:"All",    bg:"#1e2030", active:"#818cf8", border:"#3d4475"},{d:"Easy",   bg:"#052e1a", active:"#34d399", border:"#16533a"},{d:"Medium", bg:"#2d1f04", active:"#fbbf24", border:"#78450a"},{d:"Hard",   bg:"#3b0a0a", active:"#f87171", border:"#7f1d1d"},
                ].map(({d, bg, active, border}) => (
                    <button key={d} onClick={()=>setDiffFilter(d)} style={{
                        padding:"5px 13px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                        border:`1px solid ${diffFilter===d ? border : "transparent"}`,
                        background: diffFilter===d ? bg : "transparent",
                        color: diffFilter===d ? active : "#475569",
                        transition:"all 0.15s"
                    }}>{d}</button>
                ))}
            </div>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
                <input 
                    value={lcUsername} 
                    onChange={e => setLcUsername(e.target.value)} 
                    placeholder="LeetCode username" 
                    style={{padding:"6px 10px", borderRadius:20, fontSize:12, border:"1px solid #2d3154", background:"#0a0b0d", color:"#e2e8f0", outline:"none", width:130}}
                />
                <button onClick={syncFromLeetCode} disabled={lcSyncing} style={{
                    padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, cursor:lcSyncing?"wait":"pointer",
                    border:"1px solid #2d3154", background:"#11142a", color:lcSyncing?"#475569":"#818cf8", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6
                }}>
                    <span style={{fontSize:14}}>{lcSyncing ? "⏳" : "⟳"}</span>
                    {lcSyncing ? "Syncing…" : "Sync LeetCode"}
                </button>
            </div>
            {lcSyncMsg && <span style={{fontSize:11, color:lcSyncMsg.startsWith("✓")?"#34d399":"#fb923c", alignSelf:"center"}}>{lcSyncMsg}</span>}
        </div>

        {filteredSteps.map(sg => {
            const exp = expandedStep === sg.step;
            const stepProbs = sg.subtopics.reduce((a,sub)=>a+sub.problems.length,0);
            const stepSolved = sg.subtopics.reduce((a,sub,si)=>{
                return a + sub.problems.filter(p=>solvedQuestions[`s${sg.step}_${si}_${p._origIdx}`]).length;
            },0);
            const stepPct = stepProbs ? Math.round(stepSolved/stepProbs*100) : 0;
            const col = STEP_COLORS[sg.step]||"#818cf8";

            return <div key={sg.step} style={{marginBottom:8}}>
                <div onClick={()=>setExpandedStep(exp?null:sg.step)} style={{
                    background:"#0f1117",
                    border:`1px solid ${exp?"#2d3154":"#1e2030"}`,
                    borderLeft:`3px solid ${col}`,
                    borderRadius: exp?"10px 10px 0 0":10,
                    padding:"13px 18px",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    transition:"background 0.15s"
                }}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:32,height:32,borderRadius:8,background:col+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:col,flexShrink:0}}>S{sg.step}</div>
                        <div>
                            <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{sg.title}</div>
                            <div style={{fontSize:11,color:"#475569",marginTop:2}}>{stepSolved}/{stepProbs} problems solved · Week {sg.week||1}</div>
                        </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:100}}>
                            <PBar pct={stepPct} color={col} />
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:col,minWidth:36,textAlign:"right"}}>{stepPct}%</span>
                        <span style={{color:"#475569",fontSize:12,marginLeft:4}}>{exp?"▲":"▼"}</span>
                    </div>
                </div>

                {exp && <div style={{border:"1px solid #1e2030",borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,textAlign:"left"}}>
                        <thead>
                            <tr style={{background:"#0a0c14"}}>
                                <th style={{...TH, width:44, textAlign:"center"}}>Status</th>
                                <th style={{...TH, textAlign:"left", paddingLeft:14}}>Problem</th>
                                <th style={{...TH, width:90}}>Difficulty</th>
                                <th style={{...TH, width:64}}>Video</th>
                                <th style={{...TH, width:64}}>Article</th>
                                <th style={{...TH, width:80}}>Practice</th>
                                <th style={{...TH, width:64}}>Revision</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sg.subtopics.map((sub, si) => {
                                const filteredProbs = sub.problems.filter(p =>
                                    p && (diffFilter === "All" || p.difficulty === diffFilter)
                                );
                                if (filteredProbs.length === 0) return null;
                                const subSolved = sub.problems.filter(p=> p && solvedQuestions[`s${sg.step}_${si}_${p._origIdx}`]).length;
                                return [
                                    <tr key={`sub-${si}`} style={{background:"#0c0e18"}}>
                                        <td colSpan={7} style={{padding:"7px 14px"}}>
                                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                                <span style={{fontSize:11,fontWeight:700,color:col,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                                                    {sg.step}.{si+1} · {sub.name}
                                                </span>
                                                <span style={{fontSize:11,color:subSolved===sub.problems.length&&sub.problems.length>0?"#34d399":"#475569",fontWeight:600}}>
                                                    {subSolved}/{sub.problems.length} solved
                                                </span>
                                            </div>
                                        </td>
                                    </tr>,
                                    ...filteredProbs.map(p => {
                                        const pi = p._origIdx;
                                        const isDone = !!solvedQuestions[`s${sg.step}_${si}_${pi}`];
                                        const starKey = `s${sg.step}_${si}_${pi}_star`;
                                        const isStarred = !!revStars[starKey];
                                        const hasArticle = p.article && !p.article.includes("takeuforward.org/plus");
                                        const hasYT = p.yt && (p.yt.includes("youtu.be") || p.yt.includes("youtube.com"));
                                        const hasPractice = p.practice && !p.practice.includes("takeuforward.org");
                                        const diff = p.difficulty;
                                        return <tr key={pi} style={{background:isDone?"#071a1020":"#0a0b0d",borderBottom:"1px solid #13151f",transition:"background 0.15s"}}
                                            onMouseEnter={e=>e.currentTarget.style.background=isDone?"#071a1035":"#0f1117"}
                                            onMouseLeave={e=>e.currentTarget.style.background=isDone?"#071a1020":"#0a0b0d"}>
                                            <td style={{...TD, textAlign:"center"}}>
                                                <input type="checkbox" checked={isDone} onChange={()=>toggleSolved(sg.step,si,pi)}
                                                    style={{width:15,height:15,accentColor:"#34d399",cursor:"pointer"}}/>
                                            </td>
                                            <td style={{...TD, fontWeight:isDone?400:500, fontSize:13}}>
                                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                                    <span style={{flex:1, color:isDone?"#475569":"#e2e8f0", textDecoration:isDone?"line-through":"none"}}>{p.title}</span>
                                                    {(() => {
                                                        const nk = `s${sg.step}_${si}_${pi}`;
                                                        const hasNote = !!probNotes[nk];
                                                        return <span
                                                            onClick={e=>{
                                                                e.stopPropagation();
                                                                if(activeNote===nk){ setActiveNote(null); setNoteIsEditing(false); }
                                                                else {
                                                                    setActiveNote(nk);
                                                                    if (hasNote) { setNoteIsEditing(false); }
                                                                    else { setNoteText(""); setNoteIsEditing(true); }
                                                                }
                                                            }}
                                                            title={hasNote?"View / edit note":"Add note"}
                                                            style={{
                                                                cursor:"pointer", flexShrink:0, userSelect:"none",
                                                                display:"inline-flex", alignItems:"center", gap:3,
                                                                padding:"2px 7px", borderRadius:8, fontSize:10, fontWeight:600,
                                                                border:`1px solid ${hasNote?"#78450a":"#2a2e40"}`,
                                                                background:hasNote?"#2d1f04":"#13151f",
                                                                color:hasNote?"#fbbf24":"#475569",
                                                                transition:"all 0.15s", textDecoration:"none"
                                                            }}
                                                            onMouseEnter={e=>{e.currentTarget.style.borderColor=hasNote?"#fbbf24":"#475569";e.currentTarget.style.color=hasNote?"#fde68a":"#94a3b8";}}
                                                            onMouseLeave={e=>{e.currentTarget.style.borderColor=hasNote?"#78450a":"#2a2e40";e.currentTarget.style.color=hasNote?"#fbbf24":"#475569";}}
                                                        >
                                                            {hasNote ? "📝 Note" : "+ Note"}
                                                        </span>;
                                                    })()}
                                                </div>
                                                {activeNote===`s${sg.step}_${si}_${pi}` && (() => {
                                                    const nk = `s${sg.step}_${si}_${pi}`;
                                                    const existingNote = probNotes[nk];
                                                    if (existingNote && !noteIsEditing) {
                                                        return <div style={{marginTop:8,background:"#0d0f18",border:"1px solid #1e2030",borderRadius:9,padding:"12px 14px",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>
                                                            <div style={{fontSize:12,color:"#94a3b8",whiteSpace:"pre-wrap",lineHeight:1.65,fontStyle:"normal"}}>{existingNote}</div>
                                                            <div style={{display:"flex",gap:6,marginTop:10}}>
                                                                <button onClick={()=>{setNoteText(existingNote);setNoteIsEditing(true);}}
                                                                    style={{fontSize:11,padding:"4px 12px",borderRadius:6,border:"1px solid #2d3154",background:"#1a1d2e",color:"#94a3b8",cursor:"pointer"}}>Edit</button>
                                                                <button onClick={()=>{setProbNotes(prev=>{const n={...prev};delete n[nk];return n;});setActiveNote(null);setNoteIsEditing(false);}}
                                                                    style={{fontSize:11,padding:"4px 12px",borderRadius:6,border:"1px solid #7f1d1d",background:"#3b0a0a",color:"#f87171",cursor:"pointer"}}>Delete</button>
                                                                <button onClick={()=>setActiveNote(null)}
                                                                    style={{fontSize:11,padding:"4px 12px",borderRadius:6,border:"1px solid #1e2030",background:"transparent",color:"#475569",cursor:"pointer"}}>Close</button>
                                                            </div>
                                                        </div>;
                                                    }
                                                    return <div style={{marginTop:8,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>
                                                        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
                                                            autoFocus placeholder="Add your approach, key insight, or gotcha…"
                                                            style={{width:"100%",background:"#0a0c14",border:"1px solid #2d3154",borderRadius:6,color:"#e2e8f0",fontSize:11,padding:"7px 10px",resize:"vertical",minHeight:56,fontFamily:"inherit",boxSizing:"border-box",outline:"none",textDecoration:"none",lineHeight:1.5}}/>
                                                        <div style={{display:"flex",gap:6,marginTop:5}}>
                                                            <button onClick={()=>{setProbNotes(prev=>({...prev,[nk]:noteText.trim()}));setActiveNote(null);setNoteIsEditing(false);}}
                                                                style={{fontSize:11,padding:"4px 14px",borderRadius:6,border:"1px solid #34d399",background:"#052e1a",color:"#34d399",cursor:"pointer",fontWeight:600}}>Save</button>
                                                            <button onClick={()=>{setNoteIsEditing(false);if(!existingNote)setActiveNote(null);else setNoteIsEditing(false);}}
                                                                style={{fontSize:11,padding:"4px 12px",borderRadius:6,border:"1px solid #1e2030",background:"transparent",color:"#64748b",cursor:"pointer"}}>Cancel</button>
                                                            {existingNote && <button onClick={()=>{setProbNotes(prev=>{const n={...prev};delete n[nk];return n;});setActiveNote(null);setNoteIsEditing(false);}}
                                                                style={{fontSize:11,padding:"4px 12px",borderRadius:6,border:"1px solid #7f1d1d",background:"#3b0a0a",color:"#f87171",cursor:"pointer"}}>Delete</button>}
                                                        </div>
                                                    </div>;
                                                })()}
                                            </td>
                                            <td style={{...TD, textAlign:"center"}}>
                                                {diff
                                                    ? <span style={{...DIFF_BADGE[diff], padding:"2px 9px", borderRadius:10, fontSize:10, fontWeight:700, whiteSpace:"nowrap", display:"inline-block"}}>
                                                        {diff}
                                                    </span>
                                                    : <span style={{color:"#2a2e40",fontSize:13}}>—</span>}
                                            </td>
                                            <td style={{...TD, textAlign:"center"}}>
                                                {hasYT
                                                    ? <a href={p.yt} target="_blank" rel="noreferrer" title="Watch on YouTube" style={{display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                                                        <svg width="22" height="15" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg">
                                                            <rect width="20" height="14" rx="3" fill="#FF0000"/>
                                                            <polygon points="8,3.5 8,10.5 14,7" fill="white"/>
                                                        </svg>
                                                    </a>
                                                    : <span style={{color:"#2a2e40",fontSize:13}}>—</span>}
                                            </td>
                                            <td style={{...TD, textAlign:"center"}}>
                                                {hasArticle
                                                    ? <a href={p.article} target="_blank" rel="noreferrer" title="Read Article" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#60a5fa",textDecoration:"none"}}>
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                                            <polyline points="14 2 14 8 20 8"/>
                                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                                            <polyline points="10 9 9 9 8 9"/>
                                                        </svg>
                                                    </a>
                                                    : <span style={{color:"#2a2e40",fontSize:13}}>—</span>}
                                            </td>
                                            <td style={{...TD, textAlign:"center"}}>
                                                {hasPractice
                                                    ? <a href={p.practice} target="_blank" rel="noreferrer" title="Solve on LeetCode"
                                                        style={{color:"#f97316",fontWeight:700,fontSize:12,textDecoration:"none",letterSpacing:"0.02em"}}>
                                                        Solve
                                                    </a>
                                                    : <span style={{color:"#2a2e40",fontSize:13}}>—</span>}
                                            </td>
                                            <td style={{...TD, textAlign:"center"}}>
                                                <span onClick={e=>{e.stopPropagation();toggleStar(starKey);}}
                                                    title={isStarred?"Remove from revision":"Add to revision"}
                                                    style={{cursor:"pointer",fontSize:16,color:isStarred?"#fbbf24":"#2a2e40",transition:"color 0.15s",userSelect:"none"}}>
                                                    {isStarred?"★":"☆"}
                                                </span>
                                            </td>
                                        </tr>;
                                    })
                                ];
                            })}
                        </tbody>
                    </table>
                </div>}
            </div>
        })}
    </div>;
}

// ─── MATHS DATA (Dr. E. Suresh – 21MAB201T / 21MAB102T) ─────────────────────
const MATHS_UNITS = [
  { unit: 1, title: "Partial Differential Equations", playlist: "PLrhWE6dwHUeh1yEnQ1inw20VEL0gGWxgZ",
    videos: [
      { title: "PDE Elimination of Constants — Part 1", id: "boeeoZnuqLo" },
      { title: "PDE Elimination of Constants — Part 2", id: "DVhRZ2oHD9k" },
      { title: "PDE Elimination of Functions — Part 1", id: "Ql7OesqeYGQ" },
      { title: "PDE Elimination of Functions — Part 2", id: "b4QuUaRtt3Q" },
      { title: "Type 1: Solutions to First-Order PDE - Part 1", id: "X9Ci4wJrTKE" },
      { title: "Type 1: Solutions to First-Order PDE - Part 2", id: "PAab7eMvLk0" },
      { title: "Type 2: Clairaut's Form - Part 1", id: "wBJtG6_VefY" },
      { title: "Type 2: Clairaut's Form - Part 2", id: "Qz5GBzmF-ko" },
      { title: "Type 5: Lagrange — Method of Grouping", id: "5W5mGteLsZs" },
      { title: "Type 5: Lagrange — Method of Multipliers Part 1", id: "d8VAXuQBkTY" },
      { title: "Type 5: Lagrange — Method of Multipliers Part 2", id: "m0ffOYFwBRw" },
      { title: "Type 3: Solutions to First-Order PDE - Part 1", id: "-f5abSQdbcQ" },
      { title: "Type 3: Solutions to First-Order PDE - Part 2", id: "yDvNpK3lkZA" },
      { title: "Complementary Functions — Linear Homogeneous PDE", id: "KwRWqQCwnzc" },
      { title: "Type 1: e^(ax+by)", id: "GV3vYClSJGw" },
      { title: "Type 2: Cos(ax+by) or Sin(ax+by) - Part 1", id: "u9N2oUtxjk8" },
      { title: "Type 2: Cos(ax+by) or Sin(ax+by) - Part 2", id: "9w7umjX4M0Y" },
      { title: "Type 3: x^m y^n — Homogeneous Linear PDE", id: "-ih0iXxjyP0" },
      { title: "Type 4: e^(ax+by)·g(x,y) — Homogeneous Linear PDE", id: "gCQz0cO8bhs" },
      { title: "Type 5: ycos(x) or ysin(x) — Homogeneous Linear PDE", id: "WyIv5hjfW6Q" },
    ]
  },
  { unit: 2, title: "Fourier Series", playlist: "PLrhWE6dwHUejSZKUgs6pAvIBWvmyfwqcY",
    videos: [
      { title: "Fourier Series Basics (-π, π)", id: "qsdFLzxxylw" },
      { title: "Fourier Series Problems (-π, π) - Part 1", id: "Vy3rv8M5xTY" },
      { title: "Fourier Series Problems (-π, π) - Part 2", id: "dToAe93aTsg" },
      { title: "Fourier Series Problems (-l, l)", id: "GZo2eTWp9C0" },
      { title: "Fourier Series Basics (0, 2π)", id: "3Img8dWfi8c" },
      { title: "Fourier Series using Properties (0, 2π) - Part 1", id: "Z1gpukT1sJk" },
      { title: "Fourier Series using Properties (0, 2π) - Part 2", id: "RpqwqDsZpew" },
      { title: "Fourier Series Problems (0, 2π) - Part 3", id: "JXdMIezilGk" },
      { title: "Fourier Series Problems (0, 2l)", id: "6L7_YEXSf_k" },
      { title: "Half Range Fourier Series - Part 1", id: "4O23B28PgIc" },
      { title: "Half Range Fourier Series & RMS Value", id: "ZMuE5D1s0T8" },
      { title: "Harmonic Analysis - Part 1", id: "3Rxo4lxdOjk" },
      { title: "Harmonic Analysis - Part 2", id: "Db7PfVdExMM" },
      { title: "Half Range Fourier Series — Harmonic Analysis Part 2", id: "PNmw6KSAD-I" },
    ]
  },
  { unit: 3, title: "Wave & Heat Equations", playlist: "PLrhWE6dwHUejO0zZs-f7HqTzVvoeYx4br",
    videos: [
      { title: "Classification of Second Order PDE", id: "Ece3bcPZces" },
      { title: "1D Wave Equation — Basics", id: "gmWUcVtKIlI" },
      { title: "Zero Initial Velocity — Procedure", id: "X0bKENj0tzU" },
      { title: "Non-Zero Initial Velocity — Procedure", id: "27ASyeN-kPQ" },
      { title: "Zero Initial Velocity Problems - 1D Wave", id: "XmkicvCXX-g" },
      { title: "Non-Zero Initial Velocity Problems - 1D Wave", id: "p8lzNH1ilqk" },
      { title: "Zero vs Non-Zero Initial Velocity Problems", id: "wc_N-fyrqC0" },
      { title: "1D Heat Equation — Basics", id: "22ynWvLVNFY" },
      { title: "1D Heat Equation — Type 1", id: "5pRpWoqC4Ok" },
      { title: "1D Heat Equation — Type 2", id: "mEwmHcmq6I8" },
      { title: "1D Heat Equation — Type 3", id: "kbORhDtn8bE" },
      { title: "Extra: Midpoint Problem — Zero Initial Velocity", id: "Wrbw_ZmokOI" },
    ]
  },
  { unit: 4, title: "Fourier Transforms", playlist: "PLrhWE6dwHUehLPxZ-yw3udQ1OuFytsBVH",
    videos: [
      { title: "Fourier Transforms Basics - Part 1", id: "LSZORW3m0sQ" },
      { title: "Fourier Transforms - Part 2", id: "CyhbTwIGbOg" },
      { title: "Fourier Transforms - Part 3", id: "cqzIMV0Nk9Y" },
      { title: "Self Reciprocal Function — Fourier Transforms", id: "l3CWKIAPIhI" },
      { title: "Fourier Cosine & Sine Transforms - Part 1", id: "d0bX4hN82KY" },
      { title: "Fourier Cosine & Sine Transforms - Part 2", id: "xlTfcOM0Hkg" },
      { title: "Fourier Cosine & Sine Transforms - Part 3", id: "f5c-Jro0Qnk" },
      { title: "Fourier Cosine & Sine Transforms - Part 4", id: "n0ehNmnrnqs" },
    ]
  },
];

// ─── OS DATA (Gate Smashers – Operating System Complete Playlist) ────────────
const OS_PLAYLIST = "PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p";
const OS_UNITS = [
  {
    unit: 1, title: "Introduction to Operating Systems",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "Lec-0: OS Syllabus Discussion (GATE, NET, University)", id: "bkSWJJZNgf8" },
      { title: "L-1.1: Introduction to Operating System and its Functions", id: "WJ-UaAaumNA" },
      { title: "L-1.2: Batch Operating System | Types of Operating System", id: "povNcHSasgs" },
      { title: "L-1.3: Multiprogramming and Multitasking Operating System", id: "3MqyDWDpZoI" },
      { title: "L-1.4: Types of OS (Real Time, Distributed, Clustered & Embedded)", id: "YQZbIT9FcUk" },
      { title: "L-1.5: Process States in OS | Long/Short/Medium Term Schedulers", id: "2dJdHMpCLIg" },
      { title: "L-1.6: Imp Linux Commands (Operating System)", id: "-Mq8Mm_NGxI" },
      { title: "L-1.7: System Calls in Operating System and its Types", id: "tWPa-rZiGM8" },
      { title: "L-1.8: Fork() System Call with Example", id: "ixq5cpdEO2Q" },
      { title: "L-1.9: Questions on Fork() System Call With Explanation", id: "uMMvYLB4cys" },
      { title: "L-1.10: User Mode and Kernel Mode in Operating System", id: "8duV1LLHHJU" },
      { title: "L-1.11: Process Vs Threads in Operating System", id: "ITc09gOrqZk" },
      { title: "L-1.12: User Level Vs Kernel Level Thread in OS", id: "-NONm-Jq34Y" },
    ]
  },
  {
    unit: 2, title: "CPU Scheduling Algorithms",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "L-2.1: CPU Scheduling Algorithms (Preemption Vs Non-Preemption)", id: "zFnrUVqtiOY" },
      { title: "L-2.2: Arrival, Burst, Completion, Turnaround, Waiting & Response Time", id: "n7Owxwfr6Ko" },
      { title: "L-2.3: First Come First Serve (FCFS) with Example", id: "MZdVAVMgNpA" },
      { title: "L-2.4: Shortest Job First (SJF) Non-Preemptive with Example", id: "VCIVXPoiLpU" },
      { title: "L-2.5: Shortest Remaining Time First (SJF Preemptive) with Example", id: "hoN7_VMzw_g" },
      { title: "L-2.6: Question on SJF with Preemption Scheduling", id: "kbfCRoNAPbY" },
      { title: "L-2.7: Round Robin (RR) CPU Scheduling with Example", id: "TxjIlNYRZ5M" },
      { title: "L-2.8: Pre-emptive Priority Scheduling with Example", id: "rsDGfFxSgiY" },
      { title: "L-2.9: Mix Burst Time (CPU & I/O both) in CPU Scheduling", id: "0T5PlFVA9_k" },
      { title: "L-2.10: Multi Level Queue Scheduling", id: "hBPYP0ZEvS8" },
      { title: "L-2.11: Multilevel Feedback Queue Scheduling", id: "-94WGbrWveI" },
    ]
  },
  {
    unit: 3, title: "Process Synchronization",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "L-3.1: Process Synchronization | Race Condition", id: "3Eaw1SSIqRg" },
      { title: "L-3.2: Producer Consumer Problem", id: "iMD1Z3f9ioI" },
      { title: "L-3.3: Printer-Spooler Problem", id: "16NMm0jvu2w" },
      { title: "L-3.4: Critical Section Problem | Mutual Exclusion, Progress, Bounded Waiting", id: "qMQsd7Iy5jo" },
      { title: "L-3.5: LOCK Variable in OS", id: "TrV_dOX_YHw" },
      { title: "L-3.6: Test and Set Instruction in OS", id: "9hzoO4hBXFw" },
      { title: "L-3.7: Turn Variable | Strict Alteration Method", id: "kMlJT1BDIMg" },
      { title: "L-3.8: Semaphores | Wait, Signal | Counting Semaphore", id: "eoGkJWgxurQ" },
      { title: "L-3.9: Binary Semaphore Explained", id: "l5-3mbBV1BQ" },
      { title: "L-3.10: Practice Question on Binary Semaphore", id: "Tav67viXmpA" },
      { title: "L-3.11: Solution of Producer Consumer Problem using Semaphore", id: "hh9g5kKl_aE" },
      { title: "L-3.12: Solution of Readers-Writers Problem using Binary Semaphore", id: "Zdzp5k3eSYg" },
      { title: "L-3.13: Dining Philosophers Problem and Solution using Semaphore", id: "HHoB2t_B6MI" },
    ]
  },
  {
    unit: 4, title: "Deadlock",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "L-4.1: Deadlock Concept | Example | Necessary Conditions", id: "rWFH6PLOIEI" },
      { title: "L-4.2: Resource Allocation Graph (Single Instance)", id: "BW74JYB3QOM" },
      { title: "L-4.3: Multi-Instance Resource Allocation Graph with Example", id: "hJhB2ddOQtg" },
      { title: "L-4.4: Deadlock Handling Methods and Deadlock Prevention", id: "pPM9Ajqmy_4" },
      { title: "L-4.5: Banker's Algorithm with Example (Deadlock Avoidance)", id: "7gMLNiEz3nw" },
      { title: "L-4.6: GATE 2018 Question on Banker's Algorithm", id: "k8BHyy6gBls" },
      { title: "L-4.7: Question on Deadlock", id: "mGBjd2WoODs" },
      { title: "L-4.8: GATE 2018 Question on Deadlock", id: "6uEf_F1S-Jo" },
    ]
  },
  {
    unit: 5, title: "Memory Management",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "L-5.1: Memory Management and Degree of Multiprogramming", id: "eESIFJz7mJw" },
      { title: "L-5.2: Memory Management Techniques | Contiguous and Non-Contiguous", id: "FrTttJLN7Kw" },
      { title: "L-5.3: Internal Fragmentation | Fixed Size Partitioning", id: "bK-VhQA512c" },
      { title: "L-5.4: Variable Size Partitioning | Memory Management", id: "JdPmsrYqRDY" },
      { title: "L-5.5: First Fit, Next Fit, Best Fit, Worst Fit Memory Allocation", id: "N3rG_1CEQkQ" },
      { title: "L-5.6: GATE Question on First Fit, Best Fit and Worst Fit", id: "W7wDlABjCQI" },
      { title: "L-5.7: GATE 2007 Question on Fit Algorithms with Timeline", id: "XOFTINaUZt8" },
      { title: "L-5.8: Need of Paging | Memory Management", id: "I2TbCGNv1xQ" },
      { title: "L-5.9: What is Paging | Memory Management", id: "6c-mOFZwP_8" },
      { title: "L-5.10: Logical Address and Physical Address Space Questions", id: "30P73tWmU0s" },
      { title: "L-5.11: Paging Question Explanation | Memory Management", id: "L80DakYu4uw" },
      { title: "L-5.12: Page Table Entries | Format of Page Table", id: "JyPMJnnkNmQ" },
      { title: "L-5.13: 2-Level Paging | Multilevel Paging", id: "PiEq1CoP0ds" },
      { title: "L-5.14: Inverted Paging | Memory Management", id: "spApKfUa8BI" },
      { title: "L-5.15: Paging Questions (Imp for Competitive Exams)", id: "ucNJMcX-duE" },
      { title: "L-5.16: What is Thrashing | Operating System", id: "IyWaK8pbN6A" },
      { title: "L-5.17: Segmentation Vs Paging | Segmentation Working", id: "dz9Tk6KCMlQ" },
      { title: "L-5.18: Overlay | Memory Management", id: "Quj-Goz4VMA" },
      { title: "L-5.19: Virtual Memory | Page Fault | Significance of Virtual Memory", id: "o2_iCzS9-ZQ" },
      { title: "L-5.20: Translation Lookaside Buffer (TLB)", id: "Z2T2vnyZl0o" },
      { title: "L-5.21: Numerical on Translation Lookaside Buffer (TLB)", id: "Z4vzWxCcDCY" },
      { title: "L-5.22: Page Replacement Introduction | FIFO Page Replacement", id: "8rcUs5RutX0" },
      { title: "L-5.23: Belady's Anomaly in FIFO Page Replacement", id: "pR1uhp--COc" },
      { title: "L-5.24: Optimal Page Replacement Algorithm", id: "q2BpMvPhhrY" },
      { title: "L-5.25: Least Recently Used (LRU) Page Replacement", id: "dYIoWkCvd6A" },
      { title: "L-5.26: Most Recently Used (MRU) Page Replacement", id: "H3BU_Do_l-Q" },
    ]
  },
  {
    unit: 6, title: "Disk Scheduling",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "L-6.1: Hard Disk Architecture in Operating System", id: "sveZw_GG_cs" },
      { title: "L-6.2: Disk Access Time | Seek Time, Rotational Time, Transfer Time", id: "udZi6uiR8bM" },
      { title: "L-6.3: Disk Scheduling Algorithm Overview", id: "9uoa_p8q47Y" },
      { title: "L-6.4: FCFS in Disk Scheduling with Example", id: "yP89YlEGCqA" },
      { title: "L-6.5: SSTF in Disk Scheduling with Example", id: "P_dA8VGJjA8" },
      { title: "L-6.6: SCAN Algorithm in Disk Scheduling with Example", id: "xouo556RGiE" },
      { title: "L-6.7: LOOK Algorithm in Disk Scheduling with Example", id: "Q2qcqX_hvR0" },
      { title: "L-6.8: C-SCAN Algorithm in Disk Scheduling with Example", id: "vLqZ6ZMBkX8" },
      { title: "L-6.9: C-LOOK Algorithm in Disk Scheduling with Example", id: "gwCgG5ORXW8" },
      { title: "L-6.10: Important Questions on OS | NTA NET June 2021", id: "AF3FoARvtcc" },
    ]
  },
  {
    unit: 7, title: "File Systems, Protection & Extras",
    playlist: OS_PLAYLIST,
    videos: [
      { title: "L-7.1: File System in Operating System (Windows, Linux, Unix, Android)", id: "0LtuQhNFFe0" },
      { title: "L-7.2: File Attributes & Operations in Operating System", id: "q1wGGZbOr4s" },
      { title: "L-7.3: Allocation Methods in OS (Contiguous vs Non-Contiguous)", id: "J6wVO4pvUCw" },
      { title: "L-7.4: Contiguous Allocation in OS | Advantages & Disadvantages", id: "XHx-ms5Ldi4" },
      { title: "L-7.5: Linked List Allocation in File Allocation with Example", id: "irGdM3iIS54" },
      { title: "L-7.6: Indexed File Allocation in Operating System", id: "S6lLRz7SQUw" },
      { title: "L-7.7: Unix Inode Structure with Numerical Example", id: "BJ13GsC0_os" },
      { title: "Lec-8: Protection & Security in Operating System", id: "DKb7KhfoZmU" },
      { title: "TLBs Toughest Question asked in GATE Exam", id: "10tZ7JBiN0w" },
      { title: "Top 15 OS Interview Questions | Placement Strategy", id: "K1GFwYzCQlw" },
      { title: "Linker & Loader with Example", id: "j7VU5A8ajSA" },
    ]
  },
];

    // ─── MATHS TRACKER ───────────────────────────────────────────────────────────
    function MathsCheckBox({ checked, color, onClick, label }) {
        return (
            <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",userSelect:"none",padding:"3px 8px",borderRadius:6,border:`1px solid ${checked ? color+"55" : "#1e2030"}`,background:checked ? color+"18" : "transparent",transition:"all 0.15s"}}>
                <div style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${checked ? color : "#374151"}`,background:checked ? color : "transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {checked && <span style={{color:"#000",fontSize:9,fontWeight:900,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:11,color:checked ? color : "#4b5563",fontWeight:checked?600:400}}>{label}</span>
            </div>
        );
    }

    function MathsTracker({ mathsProgress, setMathsProgress }) {
        const [openUnit, setOpenUnit] = useState(1);

        function toggle(unit, idx, field) {
            setMathsProgress(prev => {
                const key = `${unit}-${idx}`;
                const cur = prev[key] || {};
                return { ...prev, [key]: { ...cur, [field]: !cur[field] } };
            });
        }

        function getKey(unit, idx) { return mathsProgress[`${unit}-${idx}`] || {}; }

        return (
            <div style={{padding:"28px 32px",maxWidth:960,margin:"0 auto"}}>
                <div style={{marginBottom:6,fontSize:22,fontWeight:700,color:"#f1f5f9"}}>Maths Tracker</div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:24}}>21MAB201T · Dr. E. Suresh · SRMIST</div>
                {MATHS_UNITS.map(u => {
                    const total = u.videos.length;
                    const watched   = u.videos.filter((_,i) => getKey(u.unit,i).watched).length;
                    const revised   = u.videos.filter((_,i) => getKey(u.unit,i).revised).length;
                    const practiced = u.videos.filter((_,i) => getKey(u.unit,i).practiced).length;
                    return (
                    <div key={u.unit} style={{marginBottom:12,border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
                        <div onClick={()=>setOpenUnit(openUnit===u.unit?null:u.unit)}
                            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:"#0d0f18",cursor:"pointer",userSelect:"none"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                                <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,background:"#1e2030",color:"#818cf8"}}>Unit {u.unit}</span>
                                <span style={{fontSize:15,fontWeight:600,color:"#e2e8f0"}}>{u.title}</span>
                                <span style={{fontSize:11,color:"#475569"}}>{total} videos</span>
                                <span style={{fontSize:11,color:"#ef4444"}}>👁 {watched}/{total}</span>
                                <span style={{fontSize:11,color:"#f59e0b"}}>↺ {revised}/{total}</span>
                                <span style={{fontSize:11,color:"#34d399"}}>✍ {practiced}/{total}</span>
                            </div>
                            <span style={{color:"#475569",fontSize:12}}>{openUnit===u.unit?"▲":"▼"}</span>
                        </div>
                        {openUnit===u.unit && (
                            <table style={{width:"100%",borderCollapse:"collapse"}}>
                                <thead>
                                    <tr style={{background:"#0a0b0d",borderTop:"1px solid #1a1d2e"}}>
                                        <th style={{padding:"7px 16px",width:32,color:"#374151",fontSize:11,fontWeight:500,textAlign:"left"}}>#</th>
                                        <th style={{padding:"7px 8px",color:"#374151",fontSize:11,fontWeight:500,textAlign:"left"}}>Topic</th>
                                        <th style={{padding:"7px 12px",color:"#374151",fontSize:11,fontWeight:500,textAlign:"center",whiteSpace:"nowrap"}}>Watch</th>
                                        <th style={{padding:"7px 12px",color:"#374151",fontSize:11,fontWeight:500,textAlign:"center",whiteSpace:"nowrap"}}>Watched</th>
                                        <th style={{padding:"7px 12px",color:"#374151",fontSize:11,fontWeight:500,textAlign:"center",whiteSpace:"nowrap"}}>Revised</th>
                                        <th style={{padding:"7px 16px",color:"#374151",fontSize:11,fontWeight:500,textAlign:"center",whiteSpace:"nowrap"}}>Practiced</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {u.videos.map((v, i) => {
                                        const s = getKey(u.unit, i);
                                        const done = s.watched && s.revised && s.practiced;
                                        return (
                                        <tr key={i} style={{borderTop:"1px solid #1a1d2e",background:done?"rgba(52,211,153,0.04)":"transparent"}}>
                                            <td style={{padding:"9px 16px",color:"#475569",fontSize:12,fontWeight:600}}>{i+1}</td>
                                            <td style={{padding:"9px 8px",color:done?"#34d399":"#cbd5e1",fontSize:13,textDecoration:done?"line-through":"none",opacity:done?0.7:1}}>{v.title}</td>
                                            <td style={{padding:"9px 12px",textAlign:"center"}}>
                                                <a href={`https://www.youtube.com/watch?v=${v.id}&list=${u.playlist}`}
                                                   target="_blank" rel="noopener noreferrer"
                                                   title="Watch on YouTube"
                                                   style={{display:"inline-flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>
                                                    <svg width="32" height="22" viewBox="0 0 32 22" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="32" height="22" rx="5" fill="#FF0000"/>
                                                        <polygon points="13,6 13,16 22,11" fill="white"/>
                                                    </svg>
                                                </a>
                                            </td>
                                            <td style={{padding:"9px 12px",textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.watched} color="#ef4444" label="Watched" onClick={()=>toggle(u.unit,i,"watched")} />
                                            </td>
                                            <td style={{padding:"9px 12px",textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.revised} color="#f59e0b" label="Revised" onClick={()=>toggle(u.unit,i,"revised")} />
                                            </td>
                                            <td style={{padding:"9px 16px",textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.practiced} color="#34d399" label="Practiced" onClick={()=>toggle(u.unit,i,"practiced")} />
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                    );
                })}
            </div>
        );
    }

    // ─── OS TRACKER ──────────────────────────────────────────────────────────────
    function OSTracker({ osProgress, setOsProgress }) {
        const [openUnit, setOpenUnit] = useState(1);

        function toggle(unit, idx, field) {
            setOsProgress(prev => {
                const key = `${unit}-${idx}`;
                const cur = prev[key] || {};
                return { ...prev, [key]: { ...cur, [field]: !cur[field] } };
            });
        }

        function getKey(unit, idx) { return osProgress[`${unit}-${idx}`] || {}; }

        const totalVideos = OS_UNITS.reduce((a, u) => a + u.videos.length, 0);
        const watchedCount = OS_UNITS.reduce((a, u) =>
            a + u.videos.filter((_, i) => getKey(u.unit, i).watched).length, 0);

        return (
            <div style={{padding:"28px 32px",maxWidth:960,margin:"0 auto"}}>
                <div style={{marginBottom:6,fontSize:22,fontWeight:700,color:"#f1f5f9"}}>OS Tracker</div>
                <div style={{marginBottom:16,fontSize:13,color:"#64748b"}}>
                    Gate Smashers · Operating System (Complete Playlist) · {watchedCount}/{totalVideos} watched
                </div>
                <div style={{marginBottom:24,background:"#1e2030",borderRadius:8,height:6,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.round(watchedCount/totalVideos*100)}%`,background:"linear-gradient(90deg,#6366f1,#818cf8)",borderRadius:8,transition:"width 0.4s"}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {OS_UNITS.map(u => {
                    const isOpen = openUnit === u.unit;
                    const unitWatched = u.videos.filter((_, i) => getKey(u.unit, i).watched).length;
                    const unitTotal = u.videos.length;
                    const unitPct = Math.round(unitWatched / unitTotal * 100);
                    return (
                    <div key={u.unit} style={{background:"#0d0f18",border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
                        <div onClick={() => setOpenUnit(isOpen ? null : u.unit)}
                            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",cursor:"pointer",background:isOpen?"#131625":"#0d0f18",transition:"background 0.15s"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                                <div style={{width:32,height:32,borderRadius:8,background:"#1e1b4b",border:"1px solid #312e81",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#818cf8",flexShrink:0}}>
                                    U{u.unit}
                                </div>
                                <div>
                                    <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{u.title}</div>
                                    <div style={{fontSize:11,color:"#475569",marginTop:2}}>{unitTotal} videos · {unitWatched} watched · {unitPct}%</div>
                                </div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{width:80,height:4,background:"#1e2030",borderRadius:4,overflow:"hidden"}}>
                                    <div style={{height:"100%",width:`${unitPct}%`,background:"#6366f1",borderRadius:4,transition:"width 0.3s"}}/>
                                </div>
                                <span style={{color:"#475569",fontSize:13,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",display:"inline-block"}}>▼</span>
                            </div>
                        </div>
                        {isOpen && (
                        <div style={{overflowX:"auto"}}>
                            <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                                <thead>
                                    <tr style={{background:"#0a0b0d",borderBottom:"1px solid #1e2030"}}>
                                        <th style={{padding:"8px 12px",textAlign:"left",fontSize:11,color:"#374151",fontWeight:600,width:40}}>#</th>
                                        <th style={{padding:"8px 12px",textAlign:"left",fontSize:11,color:"#374151",fontWeight:600}}>Topic</th>
                                        <th style={{padding:"8px 12px",textAlign:"center",fontSize:11,color:"#374151",fontWeight:600,width:60}}>Watch</th>
                                        <th style={{padding:"8px 12px",textAlign:"center",fontSize:11,color:"#374151",fontWeight:600,width:90}}>Watched</th>
                                        <th style={{padding:"8px 12px",textAlign:"center",fontSize:11,color:"#374151",fontWeight:600,width:90}}>Revised</th>
                                        <th style={{padding:"8px 16px",textAlign:"center",fontSize:11,color:"#374151",fontWeight:600,width:100}}>Practiced</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {u.videos.map((v, i) => {
                                        const s = getKey(u.unit, i);
                                        const done = s.watched && s.revised && s.practiced;
                                        return (
                                        <tr key={i} style={{borderBottom:"1px solid #0f1117",background:done?"#0a1a0a":"transparent",transition:"background 0.15s"}}
                                            onMouseEnter={e=>e.currentTarget.style.background=done?"#0a1a0a":"#0d0f18"}
                                            onMouseLeave={e=>e.currentTarget.style.background=done?"#0a1a0a":"transparent"}>
                                            <td style={{padding:"9px 12px",fontSize:12,color:"#374151",textAlign:"center"}}>{i+1}</td>
                                            <td style={{padding:"9px 12px",fontSize:13,color:done?"#4ade80":"#cbd5e1",fontWeight:done?400:500,textDecoration:done?"line-through":"none"}}>{v.title}</td>
                                            <td style={{padding:"9px 12px",textAlign:"center"}}>
                                                <a href={`https://www.youtube.com/watch?v=${v.id}&list=${u.playlist}`} target="_blank" rel="noreferrer"
                                                   title="Watch on YouTube"
                                                   style={{display:"inline-flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>
                                                    <svg width="32" height="22" viewBox="0 0 32 22" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="32" height="22" rx="5" fill="#FF0000"/>
                                                        <polygon points="13,6 13,16 22,11" fill="white"/>
                                                    </svg>
                                                </a>
                                            </td>
                                            <td style={{padding:"9px 12px",textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.watched} color="#ef4444" label="Watched" onClick={()=>toggle(u.unit,i,"watched")} />
                                            </td>
                                            <td style={{padding:"9px 12px",textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.revised} color="#f59e0b" label="Revised" onClick={()=>toggle(u.unit,i,"revised")} />
                                            </td>
                                            <td style={{padding:"9px 16px",textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.practiced} color="#34d399" label="Practiced" onClick={()=>toggle(u.unit,i,"practiced")} />
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
            </div>
        );
    }

    // ─── COA TRACKER (Gate Smashers · rebuilt as OS Tracker template) ────────────
    function COATracker({ coaGsProgress, setCoaGsProgress }) {
        const [openUnit, setOpenUnit] = useState(1);

        function toggle(unit, idx, field) {
            setCoaGsProgress(prev => {
                const key = `${unit}-${idx}`;
                const cur = prev[key] || {};
                return { ...prev, [key]: { ...cur, [field]: !cur[field] } };
            });
        }

        function getKey(unit, idx) { return coaGsProgress[`${unit}-${idx}`] || {}; }

        const totalVideos   = COA_GS_UNITS.reduce((a, u) => a + u.videos.length, 0);
        const watchedCount  = COA_GS_UNITS.reduce((a, u) =>
            a + u.videos.filter((_, i) => getKey(u.unit, i).watched).length, 0);

        return (
            <div style={{padding:"28px 32px", maxWidth:960, margin:"0 auto"}}>
                <div style={{marginBottom:6, fontSize:22, fontWeight:700, color:"#f1f5f9"}}>COA Tracker</div>
                <div style={{marginBottom:16, fontSize:13, color:"#64748b"}}>
                    Gate Smashers · Computer Organization & Architecture · {watchedCount}/{totalVideos} watched
                </div>
                <div style={{marginBottom:24, background:"#1e2030", borderRadius:8, height:6, overflow:"hidden"}}>
                    <div style={{height:"100%", width:`${totalVideos ? Math.round(watchedCount/totalVideos*100) : 0}%`, background:"linear-gradient(90deg,#34d399,#6ee7b7)", borderRadius:8, transition:"width 0.4s"}} />
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:12}}>
                {COA_GS_UNITS.map(u => {
                    const isOpen      = openUnit === u.unit;
                    const unitWatched = u.videos.filter((_, i) => getKey(u.unit, i).watched).length;
                    const unitTotal   = u.videos.length;
                    const unitPct     = unitTotal ? Math.round(unitWatched / unitTotal * 100) : 0;
                    return (
                    <div key={u.unit} style={{background:"#0d0f18", border:"1px solid #1e2030", borderRadius:12, overflow:"hidden"}}>
                        <div onClick={() => setOpenUnit(isOpen ? null : u.unit)}
                            style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", cursor:"pointer", background:isOpen?"#131625":"#0d0f18", transition:"background 0.15s"}}>
                            <div style={{display:"flex", alignItems:"center", gap:12}}>
                                <div style={{width:32, height:32, borderRadius:8, background:"#0f291e", border:"1px solid #065f46", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#34d399", flexShrink:0}}>
                                    U{u.unit}
                                </div>
                                <div>
                                    <div style={{fontSize:14, fontWeight:600, color:"#e2e8f0"}}>{u.title}</div>
                                    <div style={{fontSize:11, color:"#475569", marginTop:2}}>{unitTotal} videos · {unitWatched} watched · {unitPct}%</div>
                                </div>
                            </div>
                            <div style={{display:"flex", alignItems:"center", gap:10}}>
                                <div style={{width:80, height:4, background:"#1e2030", borderRadius:4, overflow:"hidden"}}>
                                    <div style={{height:"100%", width:`${unitPct}%`, background:"#34d399", borderRadius:4, transition:"width 0.3s"}} />
                                </div>
                                <span style={{color:"#475569", fontSize:13, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s", display:"inline-block"}}>▼</span>
                            </div>
                        </div>
                        {isOpen && (
                        <div style={{overflowX:"auto"}}>
                            <table style={{width:"100%", borderCollapse:"collapse", minWidth:600}}>
                                <thead>
                                    <tr style={{background:"#0a0b0d", borderBottom:"1px solid #1e2030"}}>
                                        <th style={{padding:"8px 12px", textAlign:"left", fontSize:11, color:"#374151", fontWeight:600, width:56}}>Label</th>
                                        <th style={{padding:"8px 12px", textAlign:"left", fontSize:11, color:"#374151", fontWeight:600}}>Topic</th>
                                        <th style={{padding:"8px 12px", textAlign:"center", fontSize:11, color:"#374151", fontWeight:600, width:60}}>Watch</th>
                                        <th style={{padding:"8px 12px", textAlign:"center", fontSize:11, color:"#374151", fontWeight:600, width:90}}>Watched</th>
                                        <th style={{padding:"8px 12px", textAlign:"center", fontSize:11, color:"#374151", fontWeight:600, width:90}}>Revised</th>
                                        <th style={{padding:"8px 16px", textAlign:"center", fontSize:11, color:"#374151", fontWeight:600, width:100}}>Practiced</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {u.videos.map((v, i) => {
                                        const s    = getKey(u.unit, i);
                                        const done = s.watched && s.revised && s.practiced;
                                        const href = coaUrl(v.id, v.search);
                                        return (
                                        <tr key={i} style={{borderBottom:"1px solid #0f1117", background:done?"#0a1a0a":"transparent", transition:"background 0.15s"}}
                                            onMouseEnter={e=>e.currentTarget.style.background=done?"#0a1a0a":"#0d0f18"}
                                            onMouseLeave={e=>e.currentTarget.style.background=done?"#0a1a0a":"transparent"}>
                                            <td style={{padding:"9px 12px", fontSize:11, color:"#34d399", fontWeight:700, whiteSpace:"nowrap"}}>{v.label || "—"}</td>
                                            <td style={{padding:"9px 12px", fontSize:13, color:done?"#4ade80":"#cbd5e1", fontWeight:done?400:500, textDecoration:done?"line-through":"none"}}>{v.title}</td>
                                            <td style={{padding:"9px 12px", textAlign:"center"}}>
                                                <a href={href} target="_blank" rel="noreferrer"
                                                   title="Watch on YouTube"
                                                   style={{display:"inline-flex", alignItems:"center", justifyContent:"center", textDecoration:"none"}}>
                                                    <svg width="32" height="22" viewBox="0 0 32 22" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="32" height="22" rx="5" fill="#FF0000"/>
                                                        <polygon points="13,6 13,16 22,11" fill="white"/>
                                                    </svg>
                                                </a>
                                            </td>
                                            <td style={{padding:"9px 12px", textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.watched}  color="#ef4444" label="Watched"   onClick={()=>toggle(u.unit,i,"watched")}   />
                                            </td>
                                            <td style={{padding:"9px 12px", textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.revised}  color="#f59e0b" label="Revised"   onClick={()=>toggle(u.unit,i,"revised")}   />
                                            </td>
                                            <td style={{padding:"9px 16px", textAlign:"center"}}>
                                                <MathsCheckBox checked={!!s.practiced} color="#34d399" label="Practiced" onClick={()=>toggle(u.unit,i,"practiced")} />
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
            </div>
        );
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
        <div style={S.grid3} className="rg3">
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
    { name:"DSA Done", value:dsaDone, fill:"#818cf8" },{ name:"DSA Left", value:dsaData.length-dsaDone, fill:"#1e2030" },{ name:"COA Done", value:coaDone, fill:"#34d399" },{ name:"COA Left", value:coaData.length-coaDone, fill:"#112211" },
    ];

    const revStats = [
    { name:"1-Day", done:revData.filter(d=>d.day).length, total:revData.length },{ name:"1-Week", done:revData.filter(d=>d.week1).length, total:revData.length },{ name:"1-Month", done:revData.filter(d=>d.month).length, total:revData.length },
    ];

    // LC stats
    const totalLC = Object.values(STEP_LEETCODE).reduce((a,v)=>a+v.length,0);

    return <div>
        <div style={S.pageTitle}>Analytics</div>
        <div style={S.pageSub}>Visual breakdown of your progress across all tracks</div>

        <div style={S.grid4} className="rg4">
            <StatCard label="DSA Subtopics" value={`${Math.round(dsaDone/dsaData.length*100)}%`}
                pct={Math.round(dsaDone/dsaData.length*100)} color="#818cf8" />
            <StatCard label="Problems Solved" value={`${Math.round(solvedP/totalP*100)}%`} sub={`${solvedP}/${totalP}`}
                pct={Math.round(solvedP/totalP*100)} color="#60a5fa" />
            <StatCard label="COA Topics" value={`${Math.round(coaDone/coaData.length*100)}%`}
                pct={Math.round(coaDone/coaData.length*100)} color="#34d399" />
            <StatCard label="LeetCode Links" value={totalLC} sub="across 17 steps" color="#f97316" icon="🔗" />
        </div>

        <div style={S.grid2} className="rg2">
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

        <div style={S.grid2} className="rg2">
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

    // ─── TODO APP ─────────────────────────────────────────────────────────────────
    function TodoApp({ todos, setTodos, setActivityLog }) {
        const PROJECTS = ["Inbox", "DSA", "COA", "Study", "Personal"];
        const P_COLORS = { 1:"#ef4444", 2:"#f97316", 3:"#3b82f6", 4:"#64748b" };
        const P_BG     = { 1:"#3b0a0a", 2:"#431407", 3:"#172554", 4:"#0f172a" };
        const P_BORDER = { 1:"#7f1d1d", 2:"#7c2d12", 3:"#1e3a8a", 4:"#1e2030" };
        const today = new Date().toISOString().slice(0,10);

        const [view, setView] = useState("inbox");
        const [addingTask, setAddingTask] = useState(false);
        const [newTask, setNewTask] = useState({ text:"", priority:4, due:"", project:"Inbox" });
        const [editId, setEditId] = useState(null);
        const [editText, setEditText] = useState("");
        const [showDone, setShowDone] = useState(false);
        const [dragId, setDragId] = useState(null);
        const [dragOverId, setDragOverId] = useState(null);
        const [dragOverSidebar, setDragOverSidebar] = useState(null);

        function openAddTask() {
            setAddingTask(true);
            if (view === "today") {
                setNewTask(t => ({ ...t, due: today }));
            }
        }

        function addTodo() {
            if (!newTask.text.trim()) return;
            let proj = newTask.project || "Inbox";
            let due = newTask.due || null;
            if (view.startsWith("p:")) proj = view.slice(2);
            if (view === "today") due = today;
            setTodos(prev => [{
                id: Date.now(),
                text: newTask.text.trim(),
                priority: newTask.priority,
                due,
                project: proj,
                done: false,
                createdAt: Date.now()
            }, ...prev]);
            setNewTask({ text:"", priority:4, due: view==="today" ? today : "", project:"Inbox" });
            setAddingTask(false);
        }

        function toggleDone(id) {
            setTodos(prev => {
                const todo = prev.find(t => t.id === id);
                if (todo && !todo.done) {
                    const todayStr = new Date().toISOString().slice(0,10);
                    setActivityLog(actLog => {
                        const dayEntries = actLog[todayStr] || [];
                        return { ...actLog, [todayStr]: [...dayEntries, { title: todo.text, project: todo.project, type:"todo" }] };
                    });
                }
                return prev.map(t => t.id===id ? { ...t, done:!t.done } : t);
            });
        }

        function deleteTodo(id) {
            setTodos(prev => prev.filter(t => t.id!==id));
        }

        function updateText(id, text) {
            if (text.trim()) setTodos(prev => prev.map(t => t.id===id ? { ...t, text:text.trim() } : t));
            setEditId(null);
        }

        function handleDragStart(e, id) {
            setDragId(id);
            e.dataTransfer.effectAllowed = "move";
        }

        function handleDragEnd() {
            setDragId(null);
            setDragOverId(null);
            setDragOverSidebar(null);
        }

        function handleDragOverCard(e, id) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (id !== dragId) setDragOverId(id);
        }

        function handleDropOnCard(e, targetId) {
            e.preventDefault();
            if (!dragId || dragId === targetId) return;
            setTodos(prev => {
                const list = [...prev];
                const fromIdx = list.findIndex(t => t.id === dragId);
                const toIdx   = list.findIndex(t => t.id === targetId);
                if (fromIdx < 0 || toIdx < 0) return prev;
                const [item] = list.splice(fromIdx, 1);
                list.splice(toIdx, 0, item);
                return list;
            });
            setDragOverId(null);
        }

        function handleDropOnSidebar(e, targetView) {
            e.preventDefault();
            if (!dragId) return;
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().slice(0,10);
            setTodos(prev => prev.map(t => {
                if (t.id !== dragId) return t;
                if (targetView === "today")    return { ...t, due: today };
                if (targetView === "inbox")    return { ...t, project: "Inbox", due: null };
                if (targetView === "upcoming") return { ...t, due: t.due && t.due > today ? t.due : tomorrowStr };
                if (targetView === "overdue")  return t;
                if (targetView.startsWith("p:")) return { ...t, project: targetView.slice(2) };
                return t;
            }));
            setDragOverSidebar(null);
            setDragId(null);
        }

        const viewedTodos = useMemo(() => {
            let list = [...todos];
            if (view === "today")           list = list.filter(t => t.due && t.due <= today);
            else if (view === "upcoming")   list = list.filter(t => t.due && t.due > today);
            else if (view === "overdue")    list = list.filter(t => t.due && t.due < today);
            else if (view.startsWith("p:")) list = list.filter(t => t.project === view.slice(2));
            else                            list = list.filter(t => t.project === "Inbox");
            if (!showDone) list = list.filter(t => !t.done);
            return list.sort((a,b) => a.done - b.done || a.priority - b.priority || a.createdAt - b.createdAt);
        }, [todos, view, showDone, today]);

        const todayCnt    = todos.filter(t => !t.done && t.due === today).length;
        const inboxCnt    = todos.filter(t => !t.done && t.project === "Inbox").length;
        const upcomingCnt = todos.filter(t => !t.done && t.due && t.due > today).length;
        const overdueCnt  = todos.filter(t => !t.done && t.due && t.due < today).length;
        const viewLabel   = view==="today" ? "Today" : view==="upcoming" ? "Upcoming" : view==="overdue" ? "Overdue" : view.startsWith("p:") ? view.slice(2) : "Inbox";

        const doneCount = todos.filter(t => {
            if (!t.done) return false;
            if (view==="today")    return t.due === today;
            if (view==="upcoming") return t.due && t.due > today;
            if (view==="overdue")  return t.project === "Inbox" && t.due && t.due < today;
            if (view.startsWith("p:")) return t.project === view.slice(2);
            return t.project === "Inbox" && !(t.due && t.due < today);
        }).length;

        const sideItems = [
            { id:"inbox",    label:"Inbox",    icon:"📥", count:inboxCnt },{ id:"today",    label:"Today",    icon:"📅", count:todayCnt },{ id:"upcoming", label:"Upcoming", icon:"📆", count:upcomingCnt },
        ];

        function SidebarItem({ s, isActive, isDragOver, onClick, onDragOver, onDragLeave, onDrop }) {
            return <div onClick={onClick} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"8px 12px", borderRadius:8, cursor:"pointer", marginBottom:2,
                background: isDragOver ? "#14241a" : isActive ? "#1a1d2e" : "transparent",
                color: isActive ? "#e2e8f0" : "#64748b", fontSize:13,
                border: isDragOver ? "1px solid #34d399" : isActive ? "1px solid #2d3154" : "1px solid transparent",
                transition:"all 0.15s"
            }}>
                <span style={{display:"flex",alignItems:"center",gap:8}}><span>{s.icon}</span><span>{s.label}</span></span>
                {s.count > 0 && <span style={{fontSize:10,color:"#475569",background:"#1e2030",padding:"1px 7px",borderRadius:10,fontWeight:600}}>{s.count}</span>}
            </div>;
        }

        return <div style={{display:"flex", gap:0, minHeight:"100%"}}>
            {/* Left sidebar */}
            <div style={{width:190, flexShrink:0, paddingRight:16, borderRight:"1px solid #1e2030", marginRight:28}}>
                <div style={{marginBottom:20}}>
                    {sideItems.map(s => <SidebarItem key={s.id} s={s}
                        isActive={view===s.id} isDragOver={dragOverSidebar===s.id}
                        onClick={()=>setView(s.id)}
                        onDragOver={e=>{e.preventDefault();setDragOverSidebar(s.id);}}
                        onDragLeave={()=>setDragOverSidebar(null)}
                        onDrop={e=>handleDropOnSidebar(e,s.id)} />)}

                    {/* Overdue — always visible, supports drag-to-move */}
                    <div onClick={()=>setView("overdue")}
                        onDragOver={e=>{e.preventDefault();setDragOverSidebar("overdue");}}
                        onDragLeave={()=>setDragOverSidebar(null)}
                        onDrop={e=>handleDropOnSidebar(e,"overdue")}
                        style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"8px 12px", borderRadius:8, cursor:"pointer", marginBottom:2,
                        background: dragOverSidebar==="overdue" ? "#2d0a0a" : view==="overdue" ? "#200a0a" : "transparent",
                        color: view==="overdue" ? "#f87171" : overdueCnt > 0 ? "#ef4444" : "#475569", fontSize:13,
                        border: dragOverSidebar==="overdue" ? "1px solid #ef4444" : view==="overdue" ? "1px solid #7f1d1d" : overdueCnt > 0 ? "1px dashed #7f1d1d" : "1px dashed #1e2030",
                        transition:"all 0.15s"
                    }}>
                        <span style={{display:"flex",alignItems:"center",gap:8}}>
                            <span>⚠️</span><span>Overdue</span>
                        </span>
                        {overdueCnt > 0 && <span style={{fontSize:10,color:"#f87171",background:"#3b0a0a",padding:"1px 7px",borderRadius:10,fontWeight:700}}>{overdueCnt}</span>}
                    </div>
                </div>

                <div style={{fontSize:10,color:"#334155",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,padding:"0 12px",fontWeight:700}}>Projects</div>
                {PROJECTS.map((proj,pi) => {
                    const cnt = todos.filter(t => !t.done && t.project===proj).length;
                    const DOT_COLORS = ["#818cf8","#34d399","#60a5fa","#fb923c","#f472b6"];
                    const vid = `p:${proj}`;
                    return <div key={proj} onClick={()=>setView(vid)}
                        onDragOver={e=>{e.preventDefault();setDragOverSidebar(vid);}}
                        onDragLeave={()=>setDragOverSidebar(null)}
                        onDrop={e=>handleDropOnSidebar(e,vid)}
                        style={{
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"8px 12px", borderRadius:8, cursor:"pointer", marginBottom:2,
                            background: dragOverSidebar===vid ? "#14241a" : view===vid ? "#1a1d2e" : "transparent",
                            color: view===vid ? "#e2e8f0" : "#64748b", fontSize:13,
                            border: dragOverSidebar===vid ? "1px solid #34d399" : view===vid ? "1px solid #2d3154" : "1px solid transparent",
                            transition:"all 0.15s"
                        }}>
                        <span style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:DOT_COLORS[pi%DOT_COLORS.length],flexShrink:0}}/>
                            <span>{proj}</span>
                        </span>
                        {cnt > 0 && <span style={{fontSize:10,color:"#475569",fontWeight:600}}>{cnt}</span>}
                    </div>;
                })}
            </div>

            {/* Main area */}
            <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                    <div>
                        <div style={S.pageTitle}>{viewLabel}</div>
                        <div style={{...S.pageSub,marginBottom:0}}>
                            {view==="overdue"
                                ? <span style={{color:"#f87171"}}>These inbox tasks missed their due date — reschedule or complete them</span>
                                : `${viewedTodos.filter(t=>!t.done).length} tasks open${doneCount>0 ? ` · ${doneCount} completed` : ""}`
                            }
                        </div>
                    </div>
                    {doneCount > 0 && <span onClick={()=>setShowDone(v=>!v)} style={{
                        fontSize:11,color:showDone?"#818cf8":"#475569",cursor:"pointer",
                        padding:"4px 12px",border:`1px solid ${showDone?"#2d3154":"#1e2030"}`,
                        borderRadius:6, transition:"all 0.15s", userSelect:"none"
                    }}>{showDone ? "Hide completed" : `Show ${doneCount} completed`}</span>}
                </div>

                {/* Add task trigger — hidden in overdue view */}
                {!addingTask && view !== "overdue" && <div onClick={openAddTask} style={{
                    display:"flex",alignItems:"center",gap:8,padding:"11px 16px",
                    border:"1px dashed #1e2030",borderRadius:10,cursor:"pointer",
                    color:"#475569",fontSize:13,marginBottom:16,transition:"all 0.15s"
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#818cf8";e.currentTarget.style.color="#818cf8";e.currentTarget.style.background="#0d0f18";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e2030";e.currentTarget.style.color="#475569";e.currentTarget.style.background="transparent";}}>
                    <span style={{fontSize:18,lineHeight:1,fontWeight:300,color:"inherit"}}>+</span>
                    <span>Add task{view==="today" ? " for Today" : ""}</span>
                </div>}

                {/* Add task form */}
                {addingTask && <div style={{border:"1px solid #2d3154",borderRadius:12,padding:"16px 18px",marginBottom:16,background:"#0f1117"}}>
                    <input autoFocus value={newTask.text}
                        onChange={e=>setNewTask(t=>({...t,text:e.target.value}))}
                        onKeyDown={e=>{if(e.key==="Enter")addTodo();if(e.key==="Escape"){setAddingTask(false);setNewTask({text:"",priority:4,due:"",project:"Inbox"});}}}
                        placeholder="Task name"
                        style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:14,fontWeight:500,marginBottom:12,fontFamily:"inherit",boxSizing:"border-box"}}/>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        {[1,2,3,4].map(p=><span key={p} onClick={()=>setNewTask(t=>({...t,priority:p}))} style={{
                            display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,
                            fontSize:11,fontWeight:700,cursor:"pointer",
                            background: newTask.priority===p ? P_BG[p] : "#13151f",
                            color: newTask.priority===p ? P_COLORS[p] : "#475569",
                            border:`1px solid ${newTask.priority===p ? P_BORDER[p] : "#1e2030"}`,
                            transition:"all 0.1s"
                        }}>P{p}</span>)}
                        <input type="date" value={newTask.due}
                            onChange={e=>setNewTask(t=>({...t,due:e.target.value}))}
                            style={{background:"#13151f",border:"1px solid #1e2030",borderRadius:6,color:newTask.due?"#e2e8f0":"#64748b",fontSize:11,padding:"4px 10px",cursor:"pointer",colorScheme:"dark",fontFamily:"inherit"}}/>
                        <select value={view.startsWith("p:") ? view.slice(2) : newTask.project}
                            onChange={e=>setNewTask(t=>({...t,project:e.target.value}))}
                            disabled={view.startsWith("p:")}
                            style={{background:"#13151f",border:"1px solid #1e2030",borderRadius:6,color:"#64748b",fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>
                            {PROJECTS.map(p=><option key={p} value={p}>{p}</option>)}
                        </select>
                        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                            <button onClick={addTodo}
                                style={{padding:"6px 18px",borderRadius:8,background:"#818cf8",border:"none",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.02em"}}>Add task</button>
                            <button onClick={()=>{setAddingTask(false);setNewTask({text:"",priority:4,due:"",project:"Inbox"});}}
                                style={{padding:"6px 14px",borderRadius:8,background:"transparent",border:"1px solid #1e2030",color:"#64748b",fontSize:12,cursor:"pointer"}}>Cancel</button>
                        </div>
                    </div>
                </div>}

                {/* Drag hint */}
                {dragId && <div style={{fontSize:11,color:"#475569",textAlign:"center",padding:"6px",marginBottom:8,background:"#0d0f18",borderRadius:8,border:"1px dashed #2d3154"}}>
                    Drop onto a sidebar item to move this task there
                </div>}

                {/* Task list — draggable cards */}
                {(() => {
                    const isGrouped = (view === "today" || view === "inbox");
                    const overdueTasks = isGrouped ? viewedTodos.filter(t => !t.done && t.due && t.due < today) : [];
                    const normalTasks  = isGrouped ? viewedTodos.filter(t => !(t.due && t.due < today) || t.done) : viewedTodos;

                    const TaskCard = (todo) => <div key={todo.id}
                        draggable={!todo.done}
                        onDragStart={e=>handleDragStart(e, todo.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e=>handleDragOverCard(e, todo.id)}
                        onDrop={e=>handleDropOnCard(e, todo.id)}
                        style={{
                            display:"flex",alignItems:"center",gap:12,
                            padding:"13px 16px",borderRadius:10,marginBottom:6,
                            background: dragOverId===todo.id && dragId!==todo.id ? "#141a2a" : todo.done ? "#0a0c10" : "#0f1117",
                            border:`1px solid ${dragOverId===todo.id && dragId!==todo.id ? "#818cf8" : dragId===todo.id ? "#2d3154" : todo.due && todo.due < today && !todo.done ? "#7f1d1d55" : "#1e2030"}`,
                            opacity: dragId===todo.id ? 0.45 : todo.done ? 0.55 : 1,
                            cursor: todo.done ? "default" : "grab",
                            transition:"all 0.12s",
                            boxShadow: dragOverId===todo.id && dragId!==todo.id ? "0 0 0 2px #818cf820" : "none",
                            userSelect:"none"
                        }}>
                        {!todo.done && <span style={{fontSize:14,color:"#2a2e40",cursor:"grab",flexShrink:0,lineHeight:1,letterSpacing:-1}}>⠿</span>}
                        <div onClick={()=>toggleDone(todo.id)} style={{
                            width:18,height:18,borderRadius:"50%",flexShrink:0,
                            border:`2px solid ${P_COLORS[todo.priority]}`,
                            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                            background: todo.done ? P_COLORS[todo.priority] : "transparent",
                            transition:"background 0.15s"
                        }}>
                            {todo.done && <span style={{color:"white",fontSize:9,lineHeight:1,fontWeight:700}}>✓</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                            {editId===todo.id
                                ? <input autoFocus value={editText}
                                    onChange={e=>setEditText(e.target.value)}
                                    onKeyDown={e=>{if(e.key==="Enter")updateText(todo.id,editText);if(e.key==="Escape")setEditId(null);}}
                                    onBlur={()=>updateText(todo.id,editText)}
                                    style={{background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",width:"100%"}}/>
                                : <span onClick={()=>{if(!todo.done){setEditId(todo.id);setEditText(todo.text);}}}
                                    style={{fontSize:13,color:todo.done?"#475569":todo.due&&todo.due<today?"#fca5a5":"#e2e8f0",textDecoration:todo.done?"line-through":"none",cursor:todo.done?"default":"text",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                    {todo.text}
                                </span>
                            }
                            {todo.project && !view.startsWith(`p:${todo.project}`) && view !== "inbox" && view !== "overdue" &&
                                <span style={{fontSize:10,color:"#475569",marginTop:1,display:"block"}}>{todo.project}</span>}
                        </div>
                        {todo.due && <span style={{
                            fontSize:11,padding:"2px 8px",borderRadius:6,flexShrink:0,
                            background: todo.due < today ? "#3b0a0a" : todo.due===today ? "#2d1f04" : "#13151f",
                            color: todo.due < today ? "#f87171" : todo.due===today ? "#fbbf24" : "#64748b",
                            border:`1px solid ${todo.due < today ? "#7f1d1d" : todo.due===today ? "#78450a" : "#1e2030"}`
                        }}>{todo.due < today ? `⚠ ${todo.due}` : todo.due===today ? "Today" : todo.due}</span>}
                        <span style={{fontSize:10,fontWeight:700,color:P_COLORS[todo.priority],flexShrink:0,minWidth:16,textAlign:"right"}}>P{todo.priority}</span>
                        <span onClick={()=>deleteTodo(todo.id)}
                            onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="0.25"}
                            style={{color:"#ef4444",cursor:"pointer",fontSize:16,lineHeight:1,padding:"0 2px",flexShrink:0,opacity:0.25,transition:"opacity 0.15s"}}>×</span>
                    </div>;

                    if (viewedTodos.length === 0) return <div style={{textAlign:"center",padding:"60px 0"}}>
                        <div style={{fontSize:42,marginBottom:14}}>{view==="overdue" ? "🎉" : "✓"}</div>
                        <div style={{fontSize:14,color:"#334155"}}>{view==="overdue" ? "No overdue tasks! You're on track." : "All clear! Press + Add task to get started."}</div>
                    </div>;

                    if (isGrouped && overdueTasks.length > 0) return <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:4}}>
                            <span style={{fontSize:10,fontWeight:700,color:"#ef4444",textTransform:"uppercase",letterSpacing:"0.08em"}}>⚠ Overdue — {overdueTasks.length} task{overdueTasks.length!==1?"s":""}</span>
                            <div style={{flex:1,height:1,background:"#7f1d1d44"}}/>
                        </div>
                        {overdueTasks.map(TaskCard)}
                        {normalTasks.filter(t=>!t.done).length > 0 && <>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:16}}>
                                <span style={{fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em"}}>{view==="today" ? "Today" : "Inbox"}</span>
                                <div style={{flex:1,height:1,background:"#1e2030"}}/>
                            </div>
                            {normalTasks.filter(t=>!t.done).map(TaskCard)}
                        </>}
                        {normalTasks.filter(t=>t.done).map(TaskCard)}
                    </div>;

                    return <div>{viewedTodos.map(TaskCard)}</div>;
                })()}
            </div>
        </div>;
    }

    // ─── MAIN APP ─────────────────────────────────────────────────────────────────
    const NAV = [
    { id:"dashboard", label:"Dashboard", icon:"⊞" },{ id:"dsa", label:"DSA Tracker", icon:"◈" },{ id:"coa", label:"COA Tracker", icon:"◉" },{ id:"maths", label:"Maths", icon:"∑" },{ id:"os", label:"OS", icon:"⚙" },{ id:"weekly", label:"Weekly Planner", icon:"▦" },{ id:"revision", label:"Revision Tracker", icon:"↺" },{ id:"analytics", label:"Analytics", icon:"⋯" },{ id:"todo", label:"To-Do", icon:"✓" },{ id:"calendar", label:"Calendar", icon:"📅" },
    ];

    function SyncModal({ syncCode, syncStatus, setSyncStatus, onSaveToCloud, onLoadFromCloud, onClose, lastSynced }) {
        const [inputCode, setInputCode] = useState(syncCode || "");
        return (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"#0f1117",border:"1px solid #2d3154",borderRadius:14,padding:"28px 32px",maxWidth:420,width:"90%",boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9"}}>☁ Cloud Sync</div>
                        <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
                    </div>
                    <div style={{fontSize:12,color:"#64748b",marginBottom:lastSynced?12:20,lineHeight:1.6}}>
                        Save your progress to the cloud and restore it on any device using your personal sync code.
                        <br/><span style={{color:"#fbbf24"}}>Note: Cloud Sync requires a PostgreSQL database configured via the DATABASE_URL environment variable.</span>
                    </div>
                    {lastSynced && (
                        <div style={{marginBottom:16,padding:"8px 12px",background:"rgba(52,211,153,0.06)",border:"1px solid #065f46",borderRadius:8,fontSize:12,color:"#34d399",display:"flex",alignItems:"center",gap:6}}>
                            <span>✓</span>
                            <span>Last synced: {new Date(lastSynced).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                    )}

                    <div style={{marginBottom:20}}>
                        <div style={{fontSize:11,color:"#94a3b8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Save current progress</div>
                        <button onClick={onSaveToCloud} style={{width:"100%",padding:"10px",background:"#1e1b4b",border:"1px solid #4338ca",borderRadius:8,color:"#a5b4fc",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                            ↑ Save to Cloud
                        </button>
                        {syncCode && (
                            <div style={{marginTop:10,padding:"10px 14px",background:"#0a0b0d",border:"1px solid #1e2030",borderRadius:8}}>
                                <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Your sync code — keep this safe:</div>
                                <div style={{fontFamily:"monospace",fontSize:15,color:"#818cf8",letterSpacing:"0.05em",userSelect:"all"}}>{syncCode}</div>
                            </div>
                        )}
                    </div>

                    <div style={{borderTop:"1px solid #1e2030",paddingTop:20}}>
                        <div style={{fontSize:11,color:"#94a3b8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Restore from another device</div>
                        <div style={{display:"flex",gap:8}}>
                            <input
                                value={inputCode}
                                onChange={e=>setInputCode(e.target.value)}
                                placeholder="Enter sync code"
                                style={{flex:1,padding:"9px 12px",background:"#1a1d2e",border:"1px solid #2d3154",borderRadius:8,color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"monospace"}}
                            />
                            <button onClick={()=>onLoadFromCloud(inputCode.trim())} style={{padding:"9px 16px",background:"#0f2918",border:"1px solid #166534",borderRadius:8,color:"#86efac",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                                ↓ Restore
                            </button>
                        </div>
                    </div>

                    {syncStatus && (
                        <div style={{marginTop:16,padding:"10px 14px",borderRadius:8,fontSize:13,
                            background: syncStatus.startsWith("✓") ? "rgba(52,211,153,0.08)" : syncStatus.startsWith("✗") ? "rgba(248,113,113,0.08)" : "rgba(129,140,248,0.08)",
                            color: syncStatus.startsWith("✓") ? "#34d399" : syncStatus.startsWith("✗") ? "#f87171" : "#818cf8",
                            border: `1px solid ${syncStatus.startsWith("✓") ? "#065f46" : syncStatus.startsWith("✗") ? "#7f1d1d" : "#312e81"}`
                        }}>
                            {syncStatus}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── MEMOIZE ALL PAGE COMPONENTS ──────────────────────────────────────────────
    // Reassigning function declarations is valid in ES modules.
    // Each component now only re-renders when its own props change.
    ActivityHeatmap = memo(ActivityHeatmap);
    Dashboard       = memo(Dashboard);
    DSATracker      = memo(DSATracker);
    MathsTracker    = memo(MathsTracker);
    OSTracker       = memo(OSTracker);
    COATracker      = memo(COATracker);
    WeeklyPlanner   = memo(WeeklyPlanner);
    RevisionTracker = memo(RevisionTracker);
    Analytics       = memo(Analytics);
    TodoApp         = memo(TodoApp);
    SyncModal       = memo(SyncModal);

    // ─── STREAK HELPERS ────────────────────────────────────────────────────────
    function getStreakDate() {
        const now = new Date();
        if (now.getHours() < 5) now.setDate(now.getDate() - 1);
        return now.toISOString().split('T')[0];
    }
    function prevDateStr(dateStr) {
        const d = new Date(dateStr + 'T12:00:00Z');
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }
    function computeStreak(activeDatesArr, freezeUsedArr) {
        const allActive = new Set([...activeDatesArr, ...freezeUsedArr]);
        const today     = getStreakDate();
        const yesterday = prevDateStr(today);
        let checkDate   = allActive.has(today) ? today : allActive.has(yesterday) ? yesterday : null;
        if (!checkDate) return 0;
        let count = 0, cur = checkDate;
        while (allActive.has(cur)) { count++; cur = prevDateStr(cur); }
        return count;
    }

    export default function App({ session, setSession }) {
    const [page, setPage] = useState("dashboard");
    const [dsaData, setDsaData] = useLocalStorage("srm_dsa_v3", DSA_TABLE, mergeDsaData);
    const [coaData, setCoaData] = useLocalStorage("srm_coa_v3", COA_TABLE, mergeCoaData);
    const [revData, setRevData] = useLocalStorage("srm_rev_v3", ALL_REV_TOPICS, mergeRevData);
    const [weekStatus, setWeekStatus] = useLocalStorage("srm_weeks_v3", Array(8).fill(false));
    const [streakData, setStreakData] = useLocalStorage("streak_data", { currentStreak:0, longestStreak:0, lastActiveDate:"", activeDates:[] });
    const [streakFreezes, setStreakFreezes] = useLocalStorage("streak_freezes", { month:"", used:[], count:0 });
    const streak = streakData.currentStreak; // compat alias for props
    const [dailyLog, setDailyLog] = useLocalStorage("srm_log_v3", []);
    const [lastLogDate, setLastLogDate] = useLocalStorage("srm_lastlog_v3", "");
    const [activityLog, setActivityLog] = useLocalStorage("srm_activity_v1", {});
    const [solvedQuestions, setSolvedQuestions] = useLocalStorage("a2z_solved", {});
    const [todos, setTodos] = useLocalStorage("studyos_todos_v1", []);
    const [probNotes, setProbNotes] = useLocalStorage("dsa_notes_v1", {});
    const [revStars, setRevStars] = useLocalStorage("dsa_rev_stars_v1", {});
    const [mathsProgress, setMathsProgress] = useLocalStorage("maths_progress_v1", {});
    const [osProgress, setOsProgress] = useLocalStorage("os_progress_v1", {});
    const [coaGsProgress, setCoaGsProgress] = useLocalStorage("coa_tracker_gs", {});
    const [confetti, setConfetti] = useState(false);
    const handleCelebrate = useCallback(() => setConfetti(true), []);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncCode, setSyncCode] = useLocalStorage("studyos_sync_code", "");
    const [syncStatus, setSyncStatus] = useState("");
    const [autoSyncStatus, setAutoSyncStatus] = useState(""); // "saving" | "saved" | "error" | ""
    const [lastSynced, setLastSynced] = useLocalStorage("studyos_last_synced", "");
    const [cloudLoadedAt, setCloudLoadedAt] = useState("");
    const autoSyncTimer = useRef(null);
    const isFirstRender = useRef(true);

    // Compute Easy/Medium/Hard solved & total counts for donut widget
    const { diffCounts, diffTotal } = useMemo(() => {
        const solved = { Easy:0, Medium:0, Hard:0 };
        const total  = { Easy:0, Medium:0, Hard:0 };
        STRIVER_STEPS.forEach(sg => {
            sg.subtopics.forEach((sub, si) => {
                sub.problems.forEach((p, pi) => {
                    if (p.difficulty) {
                        total[p.difficulty] = (total[p.difficulty]||0) + 1;
                        if (solvedQuestions[`s${sg.step}_${si}_${pi}`]) {
                            solved[p.difficulty] = (solved[p.difficulty]||0) + 1;
                        }
                    }
                });
            });
        });
        return { diffCounts: solved, diffTotal: total };
    }, [solvedQuestions]);

    // ── Supabase: load or migrate user progress on sign-in ────────────────────
    useEffect(() => {
        if (!session?.sub) return;
        loadUserProgress(session.sub).then(data => {
            if (data) {
                // Cloud data exists — restore it (cloud wins)
                if (data.dsaData)         setDsaData(mergeDsaData(data.dsaData));
                if (data.coaData)         setCoaData(mergeCoaData(data.coaData));
                if (data.revData)         setRevData(mergeRevData(data.revData));
                if (data.weekStatus)      setWeekStatus(data.weekStatus);
                if (data.streakData)           setStreakData(data.streakData);
                else if (data.streak !== undefined) setStreakData(prev => ({ ...prev, currentStreak: data.streak }));
                if (data.streakFreezes)        setStreakFreezes(data.streakFreezes);
                if (data.dailyLog)        setDailyLog(data.dailyLog);
                if (data.lastLogDate)     setLastLogDate(data.lastLogDate);
                if (data.activityLog)     setActivityLog(data.activityLog);
                if (data.solvedQuestions) setSolvedQuestions(data.solvedQuestions);
                if (data.todos)           setTodos(data.todos);
                if (data.probNotes)       setProbNotes(data.probNotes);
                if (data.revStars)        setRevStars(data.revStars);
                if (data.mathsProgress)   setMathsProgress(data.mathsProgress);
                if (data.osProgress)      setOsProgress(data.osProgress);
                setCloudLoadedAt(new Date().toISOString());
            } else {
                // First sign-in — no cloud data yet. Migrate whatever is in localStorage
                // to Supabase so existing progress is never lost.
                try {
                    const existing = {
                        dsaData:        JSON.parse(localStorage.getItem("srm_dsa_v3")   || "null"),
                        coaData:        JSON.parse(localStorage.getItem("srm_coa_v3")   || "null"),
                        revData:        JSON.parse(localStorage.getItem("srm_rev_v3")   || "null"),
                        weekStatus:     JSON.parse(localStorage.getItem("srm_weeks_v3") || "null"),
                        streak:         JSON.parse(localStorage.getItem("srm_streak_v3")|| "0"),
                        streakData:     JSON.parse(localStorage.getItem("streak_data")   || "null"),
                        streakFreezes:  JSON.parse(localStorage.getItem("streak_freezes")|| "null"),
                        dailyLog:       JSON.parse(localStorage.getItem("srm_log_v3")   || "[]"),
                        lastLogDate:    JSON.parse(localStorage.getItem("srm_lastlog_v3")|| '""'),
                        activityLog:    JSON.parse(localStorage.getItem("srm_activity_v1")|| "{}"),
                        solvedQuestions:JSON.parse(localStorage.getItem("a2z_solved")   || "{}"),
                        todos:          JSON.parse(localStorage.getItem("studyos_todos_v1")|| "[]"),
                        probNotes:      JSON.parse(localStorage.getItem("dsa_notes_v1") || "{}"),
                        revStars:       JSON.parse(localStorage.getItem("dsa_rev_stars_v1")|| "{}"),
                        mathsProgress:  JSON.parse(localStorage.getItem("maths_progress_v1")|| "{}"),
                        osProgress:     JSON.parse(localStorage.getItem("os_progress_v1")|| "{}"),
                    };
                    // Only migrate if there's actually something to save
                    const hasSomeProgress = existing.solvedQuestions && Object.keys(existing.solvedQuestions).length > 0
                        || existing.todos?.length > 0
                        || existing.streak > 0;
                    if (hasSomeProgress) saveUserProgress(session.sub, existing);
                } catch(e) { console.error("Migration error:", e); }
            }
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Streak: mark a date as LeetCode-active and recalculate ─────────────
    function markDateActive(date) {
        const monthKey    = date.slice(0, 7);
        const validFreezes = streakFreezes.month === monthKey ? streakFreezes.used : [];
        setStreakData(prev => {
            const activeDates  = [...new Set([...(prev.activeDates || []), date])];
            const newStreak    = computeStreak(activeDates, validFreezes);
            const longestStreak = Math.max(prev.longestStreak || 0, newStreak);
            return { ...prev, activeDates, lastActiveDate: date, currentStreak: newStreak, longestStreak };
        });
    }

    // ── Streak freeze: spend one freeze on targetDate ─────────────────────
    function applyFreeze(targetDate) {
        const monthKey = targetDate.slice(0, 7);
        setStreakFreezes(prev => {
            const cur = prev.month === monthKey ? prev : { month: monthKey, used: [], count: 0 };
            if (cur.count >= 3 || cur.used.includes(targetDate)) return prev;
            const used = [...cur.used, targetDate];
            setStreakData(s => {
                const newStreak = computeStreak(s.activeDates || [], used);
                return { ...s, currentStreak: Math.max(s.currentStreak, newStreak), longestStreak: Math.max(s.longestStreak, newStreak) };
            });
            return { month: monthKey, used, count: used.length };
        });
    }

    // ── On load: check if streak should break (5AM-aware), reset month freezes ─
    useEffect(() => {
        const today    = getStreakDate();
        const yesterday = prevDateStr(today);
        const monthKey = today.slice(0, 7);
        if (streakFreezes.month && streakFreezes.month !== monthKey) {
            setStreakFreezes({ month: monthKey, used: [], count: 0 });
        }
        const validFreezes = (streakFreezes.month === monthKey ? streakFreezes.used : []);
        const allActive    = new Set([...(streakData.activeDates || []), ...validFreezes]);
        if (!allActive.has(today) && !allActive.has(yesterday) && streakData.currentStreak > 0) {
            setStreakData(prev => ({ ...prev, currentStreak: 0 }));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-sync: debounce 4s after any data change
    // — Supabase save always fires when user is signed in (primary)
    // — Legacy sync-code save fires only if user has a syncCode set (secondary, optional)
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        if (!session?.sub && !syncCode) return; // nothing to sync to

        if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
        setAutoSyncStatus("saving");
        autoSyncTimer.current = setTimeout(async () => {
            const payload = { dsaData, coaData, revData, weekStatus, streak, streakData, streakFreezes, dailyLog, lastLogDate, activityLog, solvedQuestions, todos, probNotes, revStars, mathsProgress, osProgress };
            let supabaseOk = !session?.sub; // if not signed in, treat as not needed
            let legacyOk   = !syncCode;    // if no syncCode, treat as not needed

            // Primary: save to Supabase keyed by Google user ID
            if (session?.sub) {
                try {
                    await saveUserProgress(session.sub, payload);
                    supabaseOk = true;
                } catch(e) { console.error("Supabase save error:", e); }
            }

            // Secondary: save to legacy sync-code endpoint (skipped on Vercel if not available)
            if (syncCode) {
                try {
                    const res = await fetch(`/api/sync/${syncCode}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ data: payload }),
                    });
                    legacyOk = res.ok;
                } catch { legacyOk = false; }
            }

            if (supabaseOk || legacyOk) {
                setLastSynced(new Date().toISOString());
                setAutoSyncStatus("saved");
                setTimeout(() => setAutoSyncStatus(""), 3000);
            } else {
                setAutoSyncStatus("error");
            }
        }, 4000);
    }, [dsaData, coaData, revData, weekStatus, streak, dailyLog, activityLog, solvedQuestions, todos, probNotes, revStars, mathsProgress, osProgress, syncCode]);

    function handleExport() {
    const blob = new
    Blob([JSON.stringify({dsaData,coaData,revData,weekStatus,streak,dailyLog},null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="srm_studyos_progress.json";
    a.click();
    }

    function generateCode() {
        return "xxxx-xxxx-xxxx".replace(/x/g, () => Math.floor(Math.random()*16).toString(16));
    }

    async function handleSyncUp() {
        let code = syncCode;
        if (!code) { code = generateCode(); setSyncCode(code); }
        setSyncStatus("saving...");
        try {
            const payload = { dsaData, coaData, revData, weekStatus, streak, streakData, streakFreezes, dailyLog, lastLogDate, activityLog, solvedQuestions, todos, probNotes, revStars, mathsProgress, osProgress };
            const res = await fetch(`/api/sync/${code}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: payload }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `HTTP ${res.status}`);
            }
            setLastSynced(new Date().toISOString());
            setSyncStatus("✓ Saved! Use your code on any device to restore.");
        } catch(e) {
            setSyncStatus(`✗ Save failed: ${e.message}`);
        }
    }

    async function handleSyncDown(code) {
        if (!code) return;
        setSyncStatus("loading...");
        try {
            const res = await fetch(`/api/sync/${code}`);
            if (!res.ok) throw new Error("not found");
            const { data } = await res.json();
            if (data.dsaData) setDsaData(mergeDsaData(data.dsaData));
            if (data.coaData) setCoaData(mergeCoaData(data.coaData));
            if (data.revData) setRevData(mergeRevData(data.revData));
            if (data.weekStatus) setWeekStatus(data.weekStatus);
            if (data.streakData) setStreakData(data.streakData);
            else if (data.streak !== undefined) setStreakData(prev => ({ ...prev, currentStreak: data.streak }));
            if (data.streakFreezes) setStreakFreezes(data.streakFreezes);
            if (data.dailyLog) setDailyLog(data.dailyLog);
            if (data.lastLogDate) setLastLogDate(data.lastLogDate);
            if (data.activityLog) setActivityLog(data.activityLog);
            if (data.solvedQuestions) setSolvedQuestions(data.solvedQuestions);
            if (data.todos) setTodos(data.todos);
            if (data.probNotes) setProbNotes(data.probNotes);
            if (data.revStars) setRevStars(data.revStars);
            if (data.mathsProgress) setMathsProgress(data.mathsProgress);
            if (data.osProgress) setOsProgress(data.osProgress);
            setSyncCode(code);
            setLastSynced(new Date().toISOString());
            setSyncStatus("✓ Data restored! All your progress is back.");
        } catch(e) {
            setSyncStatus(e.message === "not found" ? "✗ Code not found. Check and try again." : "✗ Load failed. Try again.");
        }
    }
    function handleReset() {
        setDsaData(DSA_TABLE);
        setCoaData(COA_TABLE);
        setRevData(ALL_REV_TOPICS);
        setWeekStatus(Array(8).fill(false));
        setStreakData({ currentStreak:0, longestStreak:0, lastActiveDate:"", activeDates:[] });
        setStreakFreezes({ month:"", used:[], count:0 });
        setDailyLog([]);
        setLastLogDate("");
        setActivityLog({});
        setSolvedQuestions({});
        setTodos([]);
        setProbNotes({});
        setRevStars({});
        setMathsProgress({});
        setOsProgress({});
        setShowResetModal(false);
    }

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const isMobileNavPage = ["dashboard","dsa","coa","maths","os","weekly","revision","analytics","todo","calendar"];
    // Bottom nav shows first 5 items; rest accessible via sidebar drawer
    const BOTTOM_NAV = NAV.slice(0, 5);
    const DRAWER_NAV = NAV.slice(5);

    return (
    <div style={S.app} className="studyos-app-mobile">
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

                /* ── MOBILE RESPONSIVE ─────────────────────────────── */
                .studyos-desktop-sidebar { display: flex; }
                .studyos-mobile-header { display: none; }
                .studyos-mobile-nav { display: none; }
                .studyos-sidebar-overlay { display: none; }

                @media (max-width: 768px) {
                    .studyos-desktop-sidebar { display: none !important; }

                    .studyos-mobile-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 10px 16px;
                        background: #0f1117;
                        border-bottom: 1px solid #1e2030;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                        flex-shrink: 0;
                    }

                    .studyos-mobile-nav {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: #0f1117;
                        border-top: 1px solid #1e2030;
                        z-index: 200;
                        padding: 4px 0 env(safe-area-inset-bottom, 4px);
                        justify-content: space-around;
                        align-items: center;
                    }

                    .studyos-mobile-nav-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 2px;
                        padding: 6px 4px;
                        cursor: pointer;
                        min-width: 44px;
                        border-radius: 8px;
                        transition: all 0.15s;
                    }

                    .studyos-mobile-nav-item.active {
                        color: #818cf8;
                    }

                    .studyos-mobile-nav-item span.nav-icon {
                        font-size: 18px;
                        line-height: 1;
                    }

                    .studyos-mobile-nav-item span.nav-label {
                        font-size: 9px;
                        font-weight: 500;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 48px;
                        text-align: center;
                    }

                    .studyos-sidebar-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.7);
                        z-index: 300;
                    }

                    .studyos-sidebar-overlay.hidden { display: none; }

                    .studyos-mobile-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        width: 260px;
                        background: #0f1117;
                        border-right: 1px solid #1e2030;
                        z-index: 400;
                        display: flex;
                        flex-direction: column;
                        transform: translateX(-100%);
                        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .studyos-mobile-sidebar.open {
                        transform: translateX(0);
                    }

                    /* Main content padding on mobile */
                    .studyos-main-mobile {
                        padding: 16px 14px 80px !important;
                    }

                    /* App becomes column on mobile */
                    .studyos-app-mobile {
                        flex-direction: column;
                    }

                    /* Grid columns on mobile */
                    .studyos-grid2-mobile > * {
                        grid-column: span 2;
                    }

                    /* Responsive grids */
                    .rg2 { grid-template-columns: 1fr !important; }
                    .rg3 { grid-template-columns: 1fr !important; }
                    .rg4 { grid-template-columns: 1fr 1fr !important; }

                    /* Smaller stat values on mobile */
                    .studyos-stat-value-mobile { font-size: 20px !important; }

                    /* Smaller page title */
                    .studyos-page-title-mobile { font-size: 17px !important; }

                    /* Prevent horizontal scroll on tables */
                    .studyos-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

                    /* Filter bar stacks on mobile */
                    .studyos-filter-bar-mobile { flex-direction: column; align-items: stretch !important; }
                    .studyos-filter-bar-mobile > * { width: 100%; }

                    /* Streak box on mobile */
                    .studyos-streak-mobile { flex-direction: column; align-items: flex-start !important; }
                }

                @media (max-width: 480px) {
                    .rg4 { grid-template-columns: 1fr !important; }
                }
                `
            }
        </style>
        <Confetti active={confetti} onDone={()=>setConfetti(false)}/>
        {showSyncModal && (
            <SyncModal
                syncCode={syncCode}
                syncStatus={syncStatus}
                setSyncStatus={setSyncStatus}
                onSaveToCloud={handleSyncUp}
                onLoadFromCloud={handleSyncDown}
                onClose={() => { setShowSyncModal(false); setSyncStatus(""); }}
                lastSynced={lastSynced}
            />
        )}
        {showResetModal && (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"#0f1117",border:"1px solid #2d3154",borderRadius:14,padding:"28px 32px",maxWidth:380,width:"90%",boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
                    <div style={{fontSize:20,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Reset all progress?</div>
                    <div style={{fontSize:13,color:"#64748b",marginBottom:24,lineHeight:1.6}}>
                        This will permanently erase <span style={{color:"#f87171",fontWeight:600}}>all</span> your DSA, COA, revision, activity, streak, notes, and to-do data. This cannot be undone.
                    </div>
                    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                        <button onClick={()=>setShowResetModal(false)} style={{...S.btn(),padding:"8px 18px",fontSize:13}}>
                            Cancel
                        </button>
                        <button onClick={handleReset} style={{...S.btn(),padding:"8px 18px",fontSize:13,background:"#7f1d1d",color:"#fca5a5",border:"1px solid #991b1b"}}>
                            Yes, reset everything
                        </button>
                    </div>
                </div>
            </div>
        )}
            {/* ── MOBILE HEADER ──────────────────────────────────────── */}
                <div className="studyos-mobile-header">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <img src="/pwa-512x512.png" alt="Logo" style={{width:24,height:24}} />
                        <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",letterSpacing:"0.05em",textTransform:"uppercase"}}>StudyOS</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div onClick={()=>{ setSyncStatus(""); setShowSyncModal(true); }}
                            style={{padding:"6px 10px",borderRadius:8,background:"#1a1d2e",border:"1px solid #2d3154",cursor:"pointer",fontSize:14,color:"#818cf8"}}>
                            ☁
                        </div>
                        <div onClick={()=>setMobileSidebarOpen(true)}
                            style={{padding:"6px 10px",borderRadius:8,background:"#1a1d2e",border:"1px solid #2d3154",cursor:"pointer",fontSize:16,color:"#94a3b8"}}>
                            ☰
                        </div>
                    </div>
                </div>

                {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────── */}
                <div className={`studyos-sidebar-overlay${mobileSidebarOpen ? "" : " hidden"}`}
                    onClick={()=>setMobileSidebarOpen(false)} />
                <div className={`studyos-mobile-sidebar${mobileSidebarOpen ? " open" : ""}`}>
                    <div style={{padding:"20px 16px 12px",borderBottom:"1px solid #1e2030",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                                <img src="/pwa-512x512.png" alt="Logo" style={{width:22,height:22}} />
                                <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",letterSpacing:"0.05em",textTransform:"uppercase"}}>StudyOS</div>
                            </div>
                            <div style={{fontSize:11,color:"#4a5568"}}>SRM KTR · Sem Break</div>
                        </div>
                        <button onClick={()=>setMobileSidebarOpen(false)}
                            style={{background:"none",border:"none",color:"#64748b",fontSize:22,cursor:"pointer",lineHeight:1}}>✕</button>
                    </div>
                    {session && (
                        <div style={{margin:"10px 12px",padding:"8px 10px",background:"#0a0b0d",borderRadius:8,border:"1px solid #1e2030",display:"flex",alignItems:"center",gap:8}}>
                            {session.picture && <img src={session.picture} alt="" style={{width:24,height:24,borderRadius:"50%",flexShrink:0}} />}
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name?.split(" ")[0] || "User"}</div>
                                <div style={{fontSize:10,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.email}</div>
                            </div>
                            <div onClick={()=>{localStorage.removeItem("studyos_user");setSession(null);setMobileSidebarOpen(false);}} title="Sign out"
                                style={{cursor:"pointer",color:"#475569",fontSize:14,flexShrink:0}}>⏻</div>
                        </div>
                    )}
                    <nav style={{padding:"8px",flex:1,overflowY:"auto"}}>
                        {NAV.map(n=><div key={n.id} onClick={()=>{setPage(n.id);setMobileSidebarOpen(false);}} style={S.navItem(page===n.id)}>
                            <span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span>
                        </div>)}
                    </nav>
                    <div style={{padding:"12px 8px",borderTop:"1px solid #1e2030"}}>
                        <div onClick={()=>{ setSyncStatus(""); setShowSyncModal(true); setMobileSidebarOpen(false); }} style={{...S.navItem(false),marginBottom:4,color:"#818cf8"}}>
                            <span style={{fontSize:13}}>☁</span><span style={{fontSize:12}}>Cloud Sync</span>
                        </div>
                        <div onClick={handleExport} style={{...S.navItem(false),marginBottom:4}}>
                            <span style={{fontSize:13}}>↓</span><span style={{fontSize:12}}>Export JSON</span>
                        </div>
                        <div onClick={()=>{setShowResetModal(true);setMobileSidebarOpen(false);}} style={{...S.navItem(false),color:"#f87171"}}>
                            <span style={{fontSize:13}}>↺</span><span style={{fontSize:12}}>Reset Progress</span>
                        </div>
                    </div>
                </div>

        {/* ── DESKTOP SIDEBAR ────────────────────────────────────── */}
                <div style={S.sidebar} className="studyos-desktop-sidebar">
                <div style={S.sidebarTop}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                        <img src="/pwa-512x512.png" alt="Logo" style={{width: 22, height: 22}} />
                        <div style={{...S.logo, marginBottom: 0}}>StudyOS</div>
                    </div>
                    <div style={S.logoSub}>SRM KTR · Sem Break</div>
                    {session && (
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,padding:"8px 10px",background:"#0a0b0d",borderRadius:8,border:"1px solid #1e2030"}}>
                            {session.picture && <img src={session.picture} alt="" style={{width:24,height:24,borderRadius:"50%",flexShrink:0}} />}
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name?.split(" ")[0] || "User"}</div>
                                <div style={{fontSize:10,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.email}</div>
                            </div>
                            <div onClick={()=>{localStorage.removeItem("studyos_user");setSession(null);}} title="Sign out"
                                style={{cursor:"pointer",color:"#475569",fontSize:14,flexShrink:0,padding:2,borderRadius:4}}
                                onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                                onMouseLeave={e=>e.currentTarget.style.color="#475569"}>⏻</div>
                        </div>
                    )}
                </div>
                <nav style={S.nav}>
                    {NAV.map(n=><div key={n.id} onClick={()=>setPage(n.id)} style={S.navItem(page===n.id)}>
                        <span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span>
                    </div>)}
                </nav>
                <div style={{padding:"12px 8px",borderTop:"1px solid #1e2030"}}>
                    <div onClick={()=>{ setSyncStatus(""); setShowSyncModal(true); }} style={{...S.navItem(false),marginBottom:4,color:"#818cf8",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:13}}>☁</span><span style={{fontSize:12}}>Cloud Sync</span>
                        </div>
                        {autoSyncStatus==="saving" && <span style={{fontSize:10,color:"#818cf8",opacity:0.7}}>saving…</span>}
                        {autoSyncStatus==="saved" && <span style={{fontSize:10,color:"#34d399"}}>✓ saved</span>}
                        {autoSyncStatus==="error" && <span style={{fontSize:10,color:"#f87171"}}>✗ error</span>}
                        {!autoSyncStatus && !session?.sub && !syncCode && <span style={{fontSize:10,color:"#475569"}}>off</span>}
                        {!autoSyncStatus && (session?.sub || syncCode) && <span style={{fontSize:10,color:"#34d399",opacity:0.6}}>active</span>}
                    </div>
                    {cloudLoadedAt && (
                        <div style={{padding:"4px 10px 8px",display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:9,color:"#34d399",opacity:0.6}}>⬇</span>
                            <span style={{fontSize:9,color:"#475569",lineHeight:1.4}}>
                                Loaded from cloud<br/>
                                <span style={{color:"#64748b"}}>
                                    {new Date(cloudLoadedAt).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                                </span>
                            </span>
                        </div>
                    )}
                    <div onClick={handleExport} style={{...S.navItem(false),marginBottom:4}}>
                        <span style={{fontSize:13}}>↓</span><span style={{fontSize:12}}>Export JSON</span>
                    </div>
                    <div onClick={()=>setShowResetModal(true)} style={{...S.navItem(false),color:"#f87171"}}>
                        <span style={{fontSize:13}}>↺</span><span style={{fontSize:12}}>Reset Progress</span>
                    </div>
                </div>
            </div>
            <main style={S.main} className="studyos-main-mobile">
                {page==="dashboard" &&
                <Dashboard dsaData={dsaData} coaData={coaData} weekStatus={weekStatus} streak={streak}
                    streakData={streakData} streakFreezes={streakFreezes} onApplyFreeze={applyFreeze}
                    dailyLog={dailyLog} setDailyLog={setDailyLog} activityLog={activityLog} setActivityLog={setActivityLog}
                    diffCounts={diffCounts} diffTotal={diffTotal} solvedQuestions={solvedQuestions} todos={todos} setTodos={setTodos} revData={revData} />}
                {page==="dsa" &&
                <DSATracker dsaData={dsaData} setDsaData={setDsaData} setDailyLog={setDailyLog} lastLogDate={lastLogDate}
                    setActivityLog={setActivityLog} solvedQuestions={solvedQuestions} setSolvedQuestions={setSolvedQuestions}
                    probNotes={probNotes} setProbNotes={setProbNotes} revStars={revStars} setRevStars={setRevStars} />}
                {page==="coa" &&
                <COATracker coaGsProgress={coaGsProgress} setCoaGsProgress={setCoaGsProgress} />}
                {page==="maths" && <MathsTracker mathsProgress={mathsProgress} setMathsProgress={setMathsProgress} />}
                {page==="os" && <OSTracker osProgress={osProgress} setOsProgress={setOsProgress} />}
                {page==="weekly" && <WeeklyPlanner dsaData={dsaData} coaData={coaData} weekStatus={weekStatus}
                    setWeekStatus={setWeekStatus} onCelebrate={handleCelebrate}/>}
                    {page==="revision" &&
                    <RevisionTracker revData={revData} setRevData={setRevData} />}
                    {page==="analytics" &&
                    <Analytics dsaData={dsaData} coaData={coaData} revData={revData} weekStatus={weekStatus} />}
                    {page==="todo" && <TodoApp todos={todos} setTodos={setTodos} setActivityLog={setActivityLog} />}
                    {page==="calendar" && <CalendarTab todos={todos} weekStatus={weekStatus} />}
            </main>

            {/* ── MOBILE BOTTOM NAV ──────────────────────────────── */}
            <nav className="studyos-mobile-nav">
                {BOTTOM_NAV.map(n=>(
                    <div key={n.id}
                        className={`studyos-mobile-nav-item${page===n.id ? " active" : ""}`}
                        onClick={()=>setPage(n.id)}
                        style={{color: page===n.id ? "#818cf8" : "#475569"}}>
                        <span className="nav-icon">{n.icon}</span>
                        <span className="nav-label">{n.label}</span>
                    </div>
                ))}
                {/* More button to open drawer */}
                <div
                    className={`studyos-mobile-nav-item${DRAWER_NAV.some(n=>n.id===page) ? " active" : ""}`}
                    onClick={()=>setMobileSidebarOpen(true)}
                    style={{color: DRAWER_NAV.some(n=>n.id===page) ? "#818cf8" : "#475569"}}>
                    <span className="nav-icon">☰</span>
                    <span className="nav-label">More</span>
                </div>
            </nav>
    </div>
    );
    }