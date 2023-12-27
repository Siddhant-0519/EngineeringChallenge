import { Request } from 'express';
import {
  AssemblyLinePart,
  MachineType,
  PaintingStationPart,
  QualityControlStationPart,
  WeldingRobotPart,
  partInfo,
} from '../native-app/data/types';
import { calculateMachineHealth } from './calculations';
import PersistentData from './persistentData';

export const getMachineHealth = async (req: Request) => {
  const {
    machines,
  }: {
    machines: Record<
      MachineType,
      Record<
        | WeldingRobotPart
        | AssemblyLinePart
        | PaintingStationPart
        | QualityControlStationPart,
        string
      >
    >;
  } = req.body;

  if (!machines) {
    return { error: 'Invalid input format' };
  }

  const machineData: {
    machineName: MachineType;
    partName: string;
    partValue: string;
    machineScore: number;
  }[] = [];

  let factoryScore = 0;
  let machineCount = 0;

  // Calculate scores for each machine
  for (const machineName in machines) {
    const machine = machines[machineName as MachineType] as Record<
      | WeldingRobotPart
      | AssemblyLinePart
      | PaintingStationPart
      | QualityControlStationPart,
      string
    >;

    for (const partName in machine) {
      const partNameTyped = partName as
        | WeldingRobotPart
        | AssemblyLinePart
        | PaintingStationPart
        | QualityControlStationPart;

      const partValue = machine[partNameTyped];
      const machineScore = calculateMachineHealth(machineName as MachineType, [
        { name: partNameTyped, value: parseFloat(partValue) },
      ]);

      machineData.push({
        machineName: machineName as MachineType,
        partName: partNameTyped,
        partValue,
        machineScore: machineScore,
      });

      factoryScore += machineScore;
    }

    machineCount++;
  }

  // Calculate the factory score (average of machine scores)
  factoryScore = machineCount > 0 ? factoryScore / machineCount : 0;

  const userId = (req as any).user.userId;

  // Store user data using the Mongoose model
  try {
    await PersistentData.create({
      userId,
      parameters: {
        machineData, // Add the machineData property here
        factoryScore,
      },
    });
    console.log('Data persisted successfully:', machineData, factoryScore);
  } catch (error) {
    console.error('Error storing user data:', error);
    // Handle the error appropriately
  }

  return {
    factory: factoryScore.toFixed(2),
    machineScores: machineData.reduce((acc, data) => {
      acc[data.machineName] = data.machineScore;
      return acc;
    }, {} as Record<MachineType, number>),
  };
};
