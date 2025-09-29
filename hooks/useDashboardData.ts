import { useMemo } from 'react';
import type { EnhancedStudent } from '../types';
import { students, groupInfo, dailySchedule, allFloorLayouts } from '../data/academyData';
import { processedScheduleData } from '../data/scheduleData';
import { studentPerformanceData } from '../data/studentPerformanceData';

export const useDashboardData = () => {

  const enhancedStudents = useMemo<EnhancedStudent[]>(() => {
    return students.map(student => {
      const techInfo = groupInfo[student.techGroup];
      const performance = studentPerformanceData[student.navaId];

      return {
        ...student,
        fullName: `${student.name} ${student.surname}`,
        trackName: techInfo?.track_name || 'N/A',
        techScheduleType: techInfo?.schedule_type || 'N/A',
        aptisScores: performance?.aptis,
        grades: performance?.grades,
      };
    });
  }, [students, groupInfo, studentPerformanceData]);

  const groupStudentCounts = useMemo(() => {
    const techCounts: Record<string, number> = {};
    
    for (const student of students) {
        if (student.techGroup) {
            techCounts[student.techGroup] = (techCounts[student.techGroup] || 0) + 1;
        }
    }
    return { tech: techCounts };
  }, [students]);

  const groupCompanyMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const student of students) {
        if (student.techGroup) {
            if (!map[student.techGroup]) map[student.techGroup] = new Set();
            map[student.techGroup].add(student.company);
        }
    }
    // Convert sets to arrays for easier use
    const finalMap: Record<string, string[]> = {};
    for(const group in map) {
        finalMap[group] = Array.from(map[group]);
    }
    return finalMap;
  }, [students]);

  const kpis = useMemo(() => {
    const totalStudents = enhancedStudents.length;
    const companies = new Set(enhancedStudents.map(s => s.company));
    return {
      totalStudents,
      companyCount: companies.size,
    };
  }, [enhancedStudents]);

  const chartsData = useMemo(() => {
    const companyDistribution = Array.from(
      enhancedStudents.reduce((acc, student) => {
        acc.set(student.company, (acc.get(student.company) || 0) + 1);
        return acc;
      }, new Map<string, number>()),
      ([name, value]) => ({ name, value })
    );

    const trackDistribution = Array.from(
      enhancedStudents.reduce((acc, student) => {
        if (student.trackName && student.trackName !== 'N/A') {
          acc.set(student.trackName, (acc.get(student.trackName) || 0) + 1);
        }
        return acc;
      }, new Map<string, number>()),
      ([name, value]) => ({ name, value })
    );

    return { companyDistribution, trackDistribution };
  }, [enhancedStudents]);

  const allFilterOptions = useMemo(() => {
    const techTracks: { [key: string]: string[] } = {};
    
    enhancedStudents.forEach(student => {
      const { trackName, techGroup } = student;
      if (trackName && techGroup && trackName !== 'N/A') {
          if (!techTracks[trackName]) techTracks[trackName] = [];
          if (!techTracks[trackName].includes(techGroup)) techTracks[trackName].push(techGroup);
      }
    });

    for (const track in techTracks) {
        techTracks[track].sort();
    }
    
    const allAptisCEFRLevels = Array.from(new Set(Object.values(studentPerformanceData)
        .map(p => p.aptis?.overall.cefr)
        .filter((cefr): cefr is string => !!cefr))
    ).sort();
    
    const allFloorItems = [...allFloorLayouts.second, ...allFloorLayouts.first, ...allFloorLayouts.ground];

    return {
        allCompanies: Array.from(new Set(students.map(s => s.company))).sort(),
        allTechTracks: Object.keys(techTracks).sort(),
        allAptisCEFRLevels,
        allTechGroups: Object.values(techTracks).flat().sort(),
        allClassrooms: allFloorItems.filter(item => item.type === 'classroom' || item.type === 'lab' || item.type === 'workshop').map(item => item.name).sort(),
    };
  }, [students, enhancedStudents, studentPerformanceData, allFloorLayouts]);

  return {
    kpis,
    chartsData,
    enhancedStudents,
    dailySchedule,
    groupInfo,
    floorPlanLayout: allFloorLayouts.second, // for components that still expect a single layout
    allFloorLayouts,
    groupStudentCounts,
    processedScheduleData,
    groupCompanyMap,
    allFilterOptions,
  };
};
