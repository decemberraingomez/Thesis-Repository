import 'dotenv/config';
import mongoose from 'mongoose';
import { Thesis } from '../models/Thesis';

interface SeedThesis {
  title: string;
  abstract: string;
  authors: string[];
  adviser: string;
  year: number;
  category:
    | 'Artificial Intelligence'
    | 'Data Science'
    | 'Software Engineering'
    | 'Network & Security'
    | 'Web & Mobile Development';
  status: 'Under Review' | 'Approved' | 'Published' | 'Archived';
  defenseDate: Date;
}

const sampleTheses: SeedThesis[] = [
  {
    title: 'Automated Lost and Found System with Multimodal Vector Search',
    abstract: 'A civic web platform using CLIP embeddings to index and return lost items across municipal wards.',
    authors: ['Jezreel Onos', 'Jim Magnus Andrada'],
    adviser: 'Engr. R. Santos',
    year: 2026,
    category: 'Artificial Intelligence',
    status: 'Published',
    defenseDate: new Date('2026-05-15'),
  },
  {
    title: 'Distributed Transaction Processing in Retail Microservices',
    abstract: 'Benchmarking PySpark pipelines against standard relational database ETL processes in retail transaction datasets.',
    authors: ['December Rain Gomez'],
    adviser: 'Dr. M. Bautista',
    year: 2026,
    category: 'Data Science',
    status: 'Approved',
    defenseDate: new Date('2026-06-10'),
  },
  {
    title: 'Zero-Trust Campus Network Segmentation via 802.1X',
    abstract: 'Implementation of policy-driven VLAN routing and dynamic user credential verification across computer laboratories.',
    authors: ['Kirk Romero', 'Edrel Aquino'],
    adviser: 'Engr. F. Del Rosario',
    year: 2025,
    category: 'Network & Security',
    status: 'Published',
    defenseDate: new Date('2025-11-20'),
  },
  {
    title: 'Institutional Academic Repository and Thesis Search Engine',
    abstract: 'A decoupled single-page application providing indexed metadata search and role-based document storage tracking.',
    authors: ['Jim Magnus Andrada', 'December Rain Gomez'],
    adviser: 'Prof. L. Mendoza',
    year: 2026,
    category: 'Web & Mobile Development',
    status: 'Under Review',
    defenseDate: new Date('2026-11-05'),
  },
  {
    title: 'Computer Vision Foliage Pathology for High-Altitude Urban Crops',
    abstract: 'Convolutional neural networks trained on pechay and brassica foliage imagery to diagnose fungal damage.',
    authors: ['Jezreel Onos'],
    adviser: 'Dr. A. Cariño',
    year: 2025,
    category: 'Artificial Intelligence',
    status: 'Archived',
    defenseDate: new Date('2025-04-18'),
  },
  {
    title: 'Lightweight CSS Performance Analysis for Low-End Mobile Hardware',
    abstract: 'Evaluating execution overhead of classless and minimal CSS stylesheets against heavier utility frameworks.',
    authors: ['Jeszer Go', 'Deelan David'],
    adviser: 'Prof. C. Alcantara',
    year: 2024,
    category: 'Software Engineering',
    status: 'Published',
    defenseDate: new Date('2024-10-12'),
  },
  {
    title: 'Predictive Commuter Dispatch Modeling for Public Utility Terminals',
    abstract: 'Time-series passenger arrival forecasting to schedule vehicle dispatch intervals during peak urban commute hours.',
    authors: ['Jake Omeling'],
    adviser: 'Dr. M. Bautista',
    year: 2025,
    category: 'Data Science',
    status: 'Approved',
    defenseDate: new Date('2025-12-02'),
  },
  {
    title: 'Heuristic Mobile Phishing Detection for Telecommunications Gateways',
    abstract: 'Natural language classification engine engineered to detect scamming signatures in localized SMS traffic.',
    authors: ['Kirk Romero', 'Jezreel Onos'],
    adviser: 'Engr. R. Santos',
    year: 2026,
    category: 'Network & Security',
    status: 'Under Review',
    defenseDate: new Date('2026-03-22'),
  },
  {
    title: 'Cross-Platform Financial Ledger for Small-Scale Print Centers',
    abstract: 'A client-side calculator with dark mode state persistence and dynamic itemized cost estimation for small print shops.',
    authors: ['Deelan David'],
    adviser: 'Prof. L. Mendoza',
    year: 2024,
    category: 'Web & Mobile Development',
    status: 'Archived',
    defenseDate: new Date('2024-05-30'),
  },
  {
    title: 'Counseling Session Tracker with Field-Level Data Privacy',
    abstract: 'Data privacy act-compliant database design ensuring confidentiality in client record tracking.',
    authors: ['Edrel Aquino', 'Jeszer Go'],
    adviser: 'Prof. C. Alcantara',
    year: 2026,
    category: 'Software Engineering',
    status: 'Approved',
    defenseDate: new Date('2026-04-14'),
  },
];

async function seedDatabase(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is missing in .env configuration');
    }

    await mongoose.connect(uri);
    await Thesis.deleteMany({});
    const inserted = await Thesis.insertMany(sampleTheses);
    console.log(`Seeded ${inserted.length} theses`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();