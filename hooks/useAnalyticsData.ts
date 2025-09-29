import { useMemo } from 'react';
import type { AnalyzedStudent, EnhancedStudent, StudentGrades, AptisScores, BenchmarkAverages } from '../types';

type NavaUnitKey = 'nava001' | 'nava002' | 'nava003' | 'nava004' | 'nava005' | 'nava006' | 'nava007' | 'nava008';

const gradeToScore = (grade: string | null): number | null => {
    if (grade === null || grade === 'NA' || grade === '#N/A') return null;
    switch (grade.toUpperCase()) {
        case 'D': return 80; // Distinction
        case 'M': return 70; // Merit
        case 'P': return 60; // Pass
        case 'UC':
        case 'F':
        case 'UA':
             return 0; // Fail/Unclassified
        default: return null;
    }
};

const navaGradeToGpa = (grade: string | null): number | null => {
    if (grade === null || grade === 'NA' || grade === '#N/A') return null;
    switch (grade.toUpperCase()) {
        case 'D': return 4.0;
        case 'M': return 3.0;
        case 'P': return 2.0;
        case 'UC':
        case 'F':
        case 'UA':
             return 0.0;
        default: return null;
    }
};

const englishGradeToGpa = (grade: string | null): number | null => {
    if (grade === null || grade === 'NA' || grade === '#N/A') return null;
    switch (grade.toUpperCase()) {
        case 'A+':
        case 'A':
            return 4.0;
        case 'B+':
            return 3.5;
        case 'B':
            return 3.0;
        case 'C+':
            return 2.5;
        case 'C':
            return 2.0;
        case 'D+':
            return 1.5;
        case 'D':
            return 1.0;
        case 'F':
            return 0.0;
        default: return null;
    }
};

const getGradeFromAvg = (avg: number | null): string | null => {
    if (avg === null) return null;
    if (avg >= 95) return 'A+';
    if (avg >= 90) return 'A';
    if (avg >= 85) return 'B+';
    if (avg >= 80) return 'B';
    if (avg >= 75) return 'C+';
    if (avg >= 70) return 'C';
    if (avg >= 65) return 'D+';
    if (avg >= 60) return 'D';
    return 'F';
};


const NAVA_UNITS: NavaUnitKey[] = [
    'nava001', 'nava002', 'nava003', 
    'nava004', 'nava005', 'nava006', 'nava007', 'nava008'
];

const NAVA_UNIT_NAMES: Record<string, string> = {
    'nava001': 'NAVA001',
    'nava002': 'NAVA002',
    'nava003': 'NAVA003',
    'nava004': 'NAVA004',
    'nava005': 'NAVA005',
    'nava006': 'NAVA006',
    'nava007': 'NAVA007',
    'nava008': 'NAVA008',
};


const getPerformanceSegment = (student: { navaAverageScore: number | null, ucCount: number, aptisScores?: AptisScores }): AnalyzedStudent['performanceSegment'] => {
    const { navaAverageScore, ucCount, aptisScores } = student;
    const cefr = aptisScores?.overall?.cefr;

    // Thresholds
    const HIGH_TECH_THRESHOLD = 75;
    const AT_RISK_TECH_THRESHOLD = 60; // At pass level

    if (navaAverageScore === null) return 'Needs Support'; // No tech score is a risk

    // At-Risk has highest priority
    if (navaAverageScore < AT_RISK_TECH_THRESHOLD || ucCount > 0) {
        return 'Needs Support';
    }
    
    const isHighTech = navaAverageScore >= HIGH_TECH_THRESHOLD;
    
    // A student is linguistically strong if their CEFR level is B1 or higher.
    const isHighEnglish = cefr ? cefr.startsWith('B') || cefr.startsWith('C') : false;

    if (isHighTech && isHighEnglish) return 'High Achievers';
    if (isHighTech && !isHighEnglish) return 'Technically Strong';
    if (!isHighTech && isHighEnglish) return 'Linguistically Strong';
    
    return 'Standard';
};

export const useAnalyticsData = (students: EnhancedStudent[]) => {
    return useMemo(() => {
        // First Pass: Calculate all individual student metrics
        const studentsWithBaseMetrics = students.map(s => {
            const originalGrades = s.grades;
            let navaEnglishAverage: number | null = null;
            let newEnglishFinalGrade: string | null = originalGrades?.englishFinalGrade ?? null;
            let combinedEnglishAverage: number | null = null;
            let modifiedGrades: StudentGrades | undefined = originalGrades ? {...originalGrades, navaEnglishAverage: null} : undefined;

            if (originalGrades) {
                const unit1 = originalGrades.englishUnit1;
                const unit2 = originalGrades.englishUnit2;
                const scores = [unit1, unit2].filter((v): v is number => v !== null);

                if (scores.length > 0) {
                    navaEnglishAverage = scores.reduce((a, b) => a + b, 0) / scores.length;
                    newEnglishFinalGrade = getGradeFromAvg(navaEnglishAverage);
                }
                
                if (modifiedGrades) {
                    modifiedGrades.navaEnglishAverage = navaEnglishAverage;
                    modifiedGrades.englishFinalGrade = newEnglishFinalGrade;
                }
            }

            const aptisScore = s.aptisScores?.overall.score;
            if (navaEnglishAverage !== null && aptisScore !== undefined) {
                combinedEnglishAverage = (navaEnglishAverage * 0.4) + (aptisScore * 0.6);
            }
            
            let navaScores: number[] = [];
            let ucCount = 0;
            let distinctionCount = 0;
            const gpaPoints: number[] = [];


            if (s.grades) {
                for (const unit of NAVA_UNITS) {
                    const grade = s.grades[unit];
                    const score = gradeToScore(grade);
                    if (score !== null) {
                        navaScores.push(score);
                    }
                    if (grade === 'UC' || grade === 'F' || grade === 'UA') {
                        ucCount++;
                    }
                    if (grade === 'D') {
                        distinctionCount++;
                    }

                    const point = navaGradeToGpa(s.grades[unit]);
                    if (point !== null) {
                        gpaPoints.push(point);
                    }
                }
                const englishPoint = englishGradeToGpa(newEnglishFinalGrade);
                if (englishPoint !== null) {
                    gpaPoints.push(englishPoint);
                }
            }

            const navaAverageScore = navaScores.length > 0 ? navaScores.reduce((a, b) => a + b, 0) / navaScores.length : null;
            const gpa = gpaPoints.length > 0 ? gpaPoints.reduce((a, b) => a + b, 0) / gpaPoints.length : null;

            const studentWithMetrics = { ...s, navaAverageScore, ucCount };
            const performanceSegment = getPerformanceSegment(studentWithMetrics);

            return {
                ...s,
                grades: modifiedGrades,
                navaAverageScore,
                ucCount,
                distinctionCount,
                performanceSegment,
                gpa,
                combinedEnglishAverage,
            };
        });
        
        // Second Pass: Calculate academy and group benchmarks
        const studentsWithGpa = studentsWithBaseMetrics.filter(s => s.gpa !== null);
        const studentsWithNava = studentsWithBaseMetrics.filter(s => s.navaAverageScore !== null);
        const studentsWithAptis = studentsWithBaseMetrics.filter(s => s.aptisScores?.overall.score);

        const academyBenchmark: BenchmarkAverages = {
            gpa: studentsWithGpa.length ? studentsWithGpa.reduce((sum, s) => sum + s.gpa!, 0) / studentsWithGpa.length : 0,
            nava: studentsWithNava.length ? studentsWithNava.reduce((sum, s) => sum + s.navaAverageScore!, 0) / studentsWithNava.length : 0,
            aptis: studentsWithAptis.length ? studentsWithAptis.reduce((sum, s) => sum + s.aptisScores!.overall.score, 0) / studentsWithAptis.length : 0,
        };
        
        const groupBenchmarks = new Map<string, BenchmarkAverages>();
        const allGroupsSet = new Set(students.map(s => s.techGroup));
        allGroupsSet.forEach(groupName => {
             const groupStudents = studentsWithBaseMetrics.filter(s => s.techGroup === groupName);
             const groupWithGpa = groupStudents.filter(s => s.gpa !== null);
             const groupWithNava = groupStudents.filter(s => s.navaAverageScore !== null);
             const groupWithAptis = groupStudents.filter(s => s.aptisScores?.overall.score);
             groupBenchmarks.set(groupName, {
                gpa: groupWithGpa.length ? groupWithGpa.reduce((sum, s) => sum + s.gpa!, 0) / groupWithGpa.length : 0,
                nava: groupWithNava.length ? groupWithNava.reduce((sum, s) => sum + s.navaAverageScore!, 0) / groupWithNava.length : 0,
                aptis: groupWithAptis.length ? groupWithAptis.reduce((sum, s) => sum + s.aptisScores!.overall.score, 0) / groupWithAptis.length : 0,
             });
        });

        // Final Pass: Combine individual metrics with benchmarks
        const analyzedStudents: AnalyzedStudent[] = studentsWithBaseMetrics.map(s => ({
            ...s,
            benchmark: {
                academy: academyBenchmark,
                group: groupBenchmarks.get(s.techGroup) || { gpa: 0, nava: 0, aptis: 0 },
            }
        }));

        // Now calculate metrics based on the provided (potentially filtered) students list
        const studentsWithNavaScores = analyzedStudents.filter(s => s.navaAverageScore !== null);
        const studentsWithAptisScores = analyzedStudents.filter(s => s.aptisScores);
        
        const overallNavaAverage = studentsWithNavaScores.length > 0 ? studentsWithNavaScores.reduce((sum, s) => sum + s.navaAverageScore!, 0) / studentsWithNavaScores.length : 0;
        const overallAptisAverage = studentsWithAptisScores.length > 0 ? studentsWithAptisScores.reduce((sum, s) => sum + s.aptisScores!.overall.score, 0) / studentsWithAptisScores.length : 0;
        
        const calcAverageScores = (studentSet: AnalyzedStudent[]) => {
            const withNava = studentSet.filter(s => s.navaAverageScore !== null);
            const withAptis = studentSet.filter(s => s.aptisScores);
            return {
                nava: withNava.length > 0 ? withNava.reduce((s, c) => s + c.navaAverageScore!, 0) / withNava.length : 0,
                aptis: withAptis.length > 0 ? withAptis.reduce((s, c) => s + c.aptisScores!.overall.score, 0) / withAptis.length : 0
            };
        };

        const ceerStudents = analyzedStudents.filter(s => s.company === 'Ceer');
        const lucidStudents = analyzedStudents.filter(s => s.company === 'Lucid');
        
        const companyMetrics = {
            Ceer: calcAverageScores(ceerStudents),
            Lucid: calcAverageScores(lucidStudents),
        };

        const allGroups = Array.from(new Set(analyzedStudents.map(s => s.techGroup))).sort();
        const groupMetrics = allGroups.map(group => {
            const groupStudents = analyzedStudents.filter(s => s.techGroup === group);
            return {
                name: group,
                ...calcAverageScores(groupStudents),
            }
        });

        const unitMetrics = NAVA_UNITS.map(unit => {
            const scores = analyzedStudents
                .map(s => s.grades ? gradeToScore(s.grades[unit]) : null)
                .filter((s): s is number => s !== null);
            
            const studentsWithGradeForUnit = analyzedStudents.filter(s => s.grades && s.grades[unit] !== null);

            const ucCount = studentsWithGradeForUnit
                .filter(s => s.grades && (s.grades[unit] === 'UC' || s.grades[unit] === 'F' || s.grades[unit] === 'UA')).length;

            return {
                name: NAVA_UNIT_NAMES[unit] || unit,
                average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
                ucRate: studentsWithGradeForUnit.length > 0 ? (ucCount / studentsWithGradeForUnit.length) * 100 : 0,
            };
        }).sort((a, b) => a.average - b.average);

        const segmentCounts = analyzedStudents.reduce((acc, s) => {
            acc[s.performanceSegment] = (acc[s.performanceSegment] || 0) + 1;
            return acc;
        }, {} as Record<AnalyzedStudent['performanceSegment'], number>);

        const segmentMetrics = {
            counts: segmentCounts,
            pieData: Object.entries(segmentCounts).map(([name, value]) => ({ name, value })),
        };
        
        const correlationData = analyzedStudents
            .filter(s => s.aptisScores && s.navaAverageScore !== null)
            .map(s => ({
                aptis: s.aptisScores!.overall.score,
                nava: s.navaAverageScore!,
                name: s.fullName,
                navaId: s.navaId,
            }));

        const techGradeDistributionMap: { [key: string]: { D: number, M: number, P: number, UC: number, name: string } } = {};
        NAVA_UNITS.forEach(unit => {
            techGradeDistributionMap[unit] = { D: 0, M: 0, P: 0, UC: 0, name: NAVA_UNIT_NAMES[unit] || unit };
        });
        let totalUcCount = 0;
        let totalDistinctionCount = 0;

        analyzedStudents.forEach(s => {
            totalUcCount += s.ucCount;
            totalDistinctionCount += s.distinctionCount;
            if (s.grades) {
                NAVA_UNITS.forEach(unit => {
                    const grade = s.grades[unit];
                    if (grade) {
                        if (grade === 'D') techGradeDistributionMap[unit].D++;
                        else if (grade === 'M') techGradeDistributionMap[unit].M++;
                        else if (grade === 'P') techGradeDistributionMap[unit].P++;
                        else if (['UC', 'F', 'UA'].includes(grade)) techGradeDistributionMap[unit].UC++;
                    }
                });
            }
        });
        
        const technicalGradeDistribution = Object.values(techGradeDistributionMap);
        
        const totalGradeCounts = { D: 0, M: 0, P: 0, UC: 0 };
        analyzedStudents.forEach(s => {
            if (s.grades) {
                NAVA_UNITS.forEach(unit => {
                    const grade = s.grades[unit];
                    if (grade) {
                        const upperGrade = grade.toUpperCase();
                        if (upperGrade === 'D') totalGradeCounts.D++;
                        else if (upperGrade === 'M') totalGradeCounts.M++;
                        else if (upperGrade === 'P') totalGradeCounts.P++;
                        else if (['UC', 'F', 'UA'].includes(upperGrade)) totalGradeCounts.UC++;
                    }
                });
            }
        });

        const overallGradeDistribution = [
            { name: 'Distinction', value: totalGradeCounts.D, grade: 'D' },
            { name: 'Merit', value: totalGradeCounts.M, grade: 'M' },
            { name: 'Pass', value: totalGradeCounts.P, grade: 'P' },
            { name: 'Unclassified', value: totalGradeCounts.UC, grade: 'UC' },
        ];
        
        const avgDistinctionCount = analyzedStudents.length > 0 ? totalDistinctionCount / analyzedStudents.length : 0;

        return {
            analyzedStudents,
            overallMetrics: {
                studentCount: analyzedStudents.length,
                navaAverage: overallNavaAverage,
                aptisAverage: overallAptisAverage,
                totalUcCount,
                avgDistinctionCount
            },
            companyMetrics,
            groupMetrics,
            unitMetrics,
            segmentMetrics,
            correlationData,
            technicalGradeDistribution,
            overallGradeDistribution,
        };

    }, [students]);
};