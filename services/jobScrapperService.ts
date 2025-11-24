// Service to interact with the job scrapper backend API

export interface ScrapeParams {
  site_name: string | string[];
  search_term: string;
  location?: string;
  job_types?: string[];
  work_location_types?: string[];
}

export async function fetchJobs(params: ScrapeParams) {
  try {
    console.log('Making request to backend with params:', params);
    
    const response = await fetch('http://localhost:8000/api/scrape-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data.jobs || [];
  } catch (error: any) {
    console.error('Fetch error:', error);
    throw new Error(error.message || 'Failed to fetch jobs');
  }
}
