package com.booking.service.impl;

import java.text.Normalizer;
import java.util.*;

final class TagSearchMatcher {
 static final double THRESHOLD = 0.80;
 private TagSearchMatcher() {}
 static String normalize(String s) { return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " "); }
 static double score(String query, String candidate) {
  if (query.equals(candidate)) return 1.0;
  int max = Math.max(query.length(), candidate.length()); if (max == 0) return 0;
  return Math.max(jaroWinkler(query,candidate), 1.0 - ((double)levenshtein(query,candidate)/max));
 }
 static double jaroWinkler(String a,String b) {
  int la=a.length(), lb=b.length(); if(la==0||lb==0)return 0; int range=Math.max(0,Math.max(la,lb)/2-1); boolean[] am=new boolean[la], bm=new boolean[lb]; int m=0;
  for(int i=0;i<la;i++){int start=Math.max(0,i-range),end=Math.min(i+range+1,lb);for(int j=start;j<end;j++)if(!bm[j]&&a.charAt(i)==b.charAt(j)){am[i]=true;bm[j]=true;m++;break;}}
  if(m==0)return 0; int k=0,t=0;for(int i=0;i<la;i++)if(am[i]){while(!bm[k])k++;if(a.charAt(i)!=b.charAt(k))t++;k++;} double j=((double)m/la+(double)m/lb+(double)(m-t/2.0)/m)/3.0; int prefix=0;while(prefix<Math.min(4,Math.min(la,lb))&&a.charAt(prefix)==b.charAt(prefix))prefix++;return j+prefix*0.1*(1-j);
 }
 static int levenshtein(String a,String b){int[] p=new int[b.length()+1],c=new int[b.length()+1];for(int j=0;j<=b.length();j++)p[j]=j;for(int i=1;i<=a.length();i++){c[0]=i;for(int j=1;j<=b.length();j++)c[j]=Math.min(Math.min(c[j-1]+1,p[j]+1),p[j-1]+(a.charAt(i-1)==b.charAt(j-1)?0:1));int[] x=p;p=c;c=x;}return p[b.length()];}
 static Map<String,Double> vocabularyMatch(String query, Collection<String> vocabulary){String q=normalize(query);Map<String,Double> out=new HashMap<>();if(q.isBlank())return out;if(q.length()<3){for(String w:vocabulary)if(q.equals(normalize(w)))out.put(normalize(w),1.0);return out;}for(String word:vocabulary){String n=normalize(word);double s=score(q,n);if(s>=THRESHOLD)out.merge(n,s,Math::max);}return out;}
}
