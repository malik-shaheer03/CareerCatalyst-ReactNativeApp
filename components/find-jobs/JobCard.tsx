import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface JobCardProps {
  job: any;
  onApply?: () => void;
  onSave?: () => void;
}

// Helper functions to get correct source information
const getSourceIcon = (job: any) => {
  if (job.source?.logo) {
    return job.source.logo;
  }
  // Fallback to site check
  return job.site === 'linkedin' ? 'linkedin' : 'briefcase';
};

const getSourceColor = (job: any) => {
  if (job.source?.color) {
    return job.source.color;
  }
  // Fallback to site check
  return job.site === 'linkedin' ? '#0077b5' : '#2557a7';
};

const getSourceName = (job: any) => {
  if (job.source?.name) {
    return job.source.name;
  }
  // Fallback to site check
  return job.site === 'linkedin' ? 'LinkedIn' : 'Indeed';
};

// Helper function to check if job is from external source (scraped)
const isExternalJob = (job: any) => {
  return job.source || job.site;
};

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onSave }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: job.companyColor }]}>
          <Icon name={job.companyIcon} size={24} color="#fff" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{job.title}</Text>
          <Text style={styles.company} numberOfLines={1} ellipsizeMode="tail">{job.company}</Text>
          <View style={styles.meta}>
            <Icon name="map-marker" size={12} color="#666" />
            <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">{job.location}</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{job.type}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.salaryRow}>
        <Text style={styles.salaryText}>{job.salary}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.sourceContainer}>
          {isExternalJob(job) && (
            <>
              <Icon name={getSourceIcon(job)} 
                    size={16} 
                    color={getSourceColor(job)} />
              <Text style={[styles.sourceText, { color: getSourceColor(job) }]}>
                {getSourceName(job)}
              </Text>
              <Text style={styles.datePosted}>• {job.date_posted}</Text>
            </>
          )}
          {!isExternalJob(job) && job.postedDate && (
            <Text style={styles.datePosted}>
              Posted {new Date(job.postedDate).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.applyButton} onPress={onApply}>
            <Text style={styles.applyButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logo: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
    flexShrink: 0,
  },
  info: { 
    flex: 1, 
    minWidth: 0, // This helps with text overflow
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222',
    lineHeight: 22,
    marginBottom: 4,
  },
  company: { 
    fontSize: 14, 
    color: '#666',
    marginBottom: 4,
  },
  meta: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  location: { 
    fontSize: 12, 
    color: '#666', 
    marginLeft: 4,
    marginRight: 8,
    maxWidth: 120, // Limit location text width
  },
  typeTag: { 
    backgroundColor: '#E0F2F1', 
    borderRadius: 8, 
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeTagText: { 
    fontSize: 12, 
    color: '#00796B' 
  },
  salaryRow: {
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 52, // Align with the text content
  },
  salaryText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#00796B' 
  },
  footer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  sourceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    marginRight: 12,
  },
  sourceText: { 
    fontSize: 12, 
    fontWeight: '600', 
    marginLeft: 4 
  },
  datePosted: { 
    fontSize: 12, 
    color: '#666', 
    marginLeft: 8,
    flexShrink: 0,
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  applyButton: { 
    backgroundColor: '#00796B', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 8,
  },
  applyButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
});

export default JobCard;
